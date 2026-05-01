import { Redis } from "@upstash/redis";
import { CURRENT } from "@/data/current";
import { logError } from "./alert";

const RATE_CACHE_KEY = "mti:fx:usdils";
const RATE_CACHE_TS_KEY = "mti:fx:usdils:ts";
const CACHE_FRESHNESS_MS = 24 * 60 * 60 * 1000;
const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function isBenignFrameworkError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes("Dynamic server usage") || msg.includes("DYNAMIC_SERVER_USAGE");
}

let redis: Redis | null = null;
function redisClient(): Redis | null {
  if (redis) return redis;
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  redis = new Redis({ url, token });
  return redis;
}

function isValidRate(n: number): boolean {
  return !isNaN(n) && n >= 2 && n <= 6;
}

async function fetchFromStooq(): Promise<number | null> {
  try {
    const res = await fetch("https://stooq.com/q/l/?s=usdils&f=sd2t2ohlcv&h&e=csv", {
      next: { revalidate: 3600 },
      headers: { "User-Agent": BROWSER_UA, Accept: "text/csv,text/plain,*/*" },
    });
    if (!res.ok) {
      console.error(`[fx.stooq] HTTP ${res.status}`);
      return null;
    }
    const text = await res.text();
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) {
      console.error(`[fx.stooq] malformed: lines=${lines.length} body=${text.slice(0, 100)}`);
      return null;
    }
    const close = parseFloat(lines[1].split(",")[6]);
    if (!isValidRate(close)) {
      console.error(`[fx.stooq] out-of-range: ${close}`);
      return null;
    }
    return close;
  } catch (err) {
    if (!isBenignFrameworkError(err)) console.error("[fx.stooq] fetch failed:", err);
    return null;
  }
}

async function fetchFromOpenER(): Promise<number | null> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 3600 },
      headers: { "User-Agent": BROWSER_UA, Accept: "application/json" },
    });
    if (!res.ok) {
      console.error(`[fx.open-er] HTTP ${res.status}`);
      return null;
    }
    const data = (await res.json()) as { result?: string; rates?: Record<string, number> };
    if (data.result !== "success") {
      console.error(`[fx.open-er] non-success result: ${data.result}`);
      return null;
    }
    const rate = data.rates?.ILS;
    if (typeof rate !== "number" || !isValidRate(rate)) {
      console.error(`[fx.open-er] invalid rate: ${rate}`);
      return null;
    }
    return rate;
  } catch (err) {
    if (!isBenignFrameworkError(err)) console.error("[fx.open-er] fetch failed:", err);
    return null;
  }
}

async function readCachedRate(): Promise<{ value: number; ageMs: number } | null> {
  const c = redisClient();
  if (!c) return null;
  try {
    const [rawRate, rawTs] = await c.mget<[unknown, unknown]>(RATE_CACHE_KEY, RATE_CACHE_TS_KEY);
    const value = typeof rawRate === "number" ? rawRate : parseFloat(String(rawRate ?? ""));
    const ts = typeof rawTs === "number" ? rawTs : parseInt(String(rawTs ?? ""), 10);
    if (!isValidRate(value) || !ts) return null;
    return { value, ageMs: Date.now() - ts };
  } catch (err) {
    if (!isBenignFrameworkError(err)) console.error("[fx.cache.read] failed:", err);
    return null;
  }
}

async function writeCachedRate(value: number): Promise<void> {
  const c = redisClient();
  if (!c) return;
  try {
    await c.mset({ [RATE_CACHE_KEY]: value, [RATE_CACHE_TS_KEY]: Date.now() });
  } catch (err) {
    if (!isBenignFrameworkError(err)) console.error("[fx.cache.write] failed:", err);
  }
}

export async function getUsdIlsRate(): Promise<number> {
  const fallback = CURRENT.israel.ilsPerUsdFallback;

  const stooq = await fetchFromStooq();
  if (stooq !== null) {
    await writeCachedRate(stooq);
    return stooq;
  }

  const backup = await fetchFromOpenER();
  if (backup !== null) {
    await writeCachedRate(backup);
    return backup;
  }

  const cached = await readCachedRate();
  if (cached && cached.ageMs < CACHE_FRESHNESS_MS) {
    return cached.value;
  }

  await logError("fx.all_sources_failed", "Stooq + open.er-api both failed, no fresh cache", {
    cacheAgeHours: cached ? Math.round(cached.ageMs / 3600000) : null,
    fallback,
  });
  return cached?.value ?? fallback;
}
