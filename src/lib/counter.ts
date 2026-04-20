import { Redis } from "@upstash/redis";
import { logError } from "./alert";

let redis: Redis | null = null;
let loggedMissingConfig = false;

function client(): Redis | null {
  if (redis) return redis;
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    if (!loggedMissingConfig) {
      loggedMissingConfig = true;
      void logError("counter.config", "Missing KV env vars (KV_REST_API_URL / KV_REST_API_TOKEN)", {});
    }
    return null;
  }
  redis = new Redis({ url, token });
  return redis;
}

const TOTAL_KEY = "mti:calc:total";
const MONTH_KEY_PREFIX = "mti:calc:month:";

function monthKey(d = new Date()): string {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${MONTH_KEY_PREFIX}${yyyy}-${mm}`;
}

export async function incrementCalculation(): Promise<number> {
  const c = client();
  if (!c) return 0;
  try {
    const total = await c.incr(TOTAL_KEY);
    await c.incr(monthKey());
    return total;
  } catch (err) {
    await logError("counter.incr", err);
    return 0;
  }
}

function isBenignFrameworkError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("Dynamic server usage") ||
    msg.includes("Route / couldn") ||
    msg.includes("DYNAMIC_SERVER_USAGE")
  );
}

export async function getTotalCount(): Promise<number> {
  const c = client();
  if (!c) return 0;
  try {
    const v = await c.get<number>(TOTAL_KEY);
    return typeof v === "number" ? v : parseInt(String(v ?? 0), 10) || 0;
  } catch (err) {
    if (!isBenignFrameworkError(err)) await logError("counter.getTotal", err);
    return 0;
  }
}

export async function getMonthCount(d = new Date()): Promise<number> {
  const c = client();
  if (!c) return 0;
  try {
    const v = await c.get<number>(monthKey(d));
    return typeof v === "number" ? v : parseInt(String(v ?? 0), 10) || 0;
  } catch (err) {
    if (!isBenignFrameworkError(err)) await logError("counter.getMonth", err);
    return 0;
  }
}

export async function getAllMonthlyCounts(): Promise<Record<string, number>> {
  const c = client();
  if (!c) return {};
  try {
    const keys = await c.keys(`${MONTH_KEY_PREFIX}*`);
    if (keys.length === 0) return {};
    const values = await c.mget<number[]>(...keys);
    const result: Record<string, number> = {};
    keys.forEach((k, i) => {
      const month = k.replace(MONTH_KEY_PREFIX, "");
      result[month] = Number(values[i] ?? 0);
    });
    return result;
  } catch (err) {
    if (!isBenignFrameworkError(err)) await logError("counter.listMonthly", err);
    return {};
  }
}
