import { CURRENT } from "@/data/current";
import { logError } from "./alert";

function isBenignFrameworkError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes("Dynamic server usage") || msg.includes("DYNAMIC_SERVER_USAGE");
}

export async function getUsdIlsRate(): Promise<number> {
  const fallback = CURRENT.israel.ilsPerUsdFallback;
  try {
    const res = await fetch("https://stooq.com/q/l/?s=usdils&f=sd2t2ohlcv&h&e=csv", {
      next: { revalidate: 3600 },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/csv,text/plain,*/*",
      },
    });
    if (!res.ok) {
      await logError("fx.stooq", `Non-OK HTTP status: ${res.status}`, { fallback });
      return fallback;
    }
    const text = await res.text();
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) {
      await logError("fx.stooq", "Malformed CSV response", {
        lines: lines.length,
        bodySnippet: text.slice(0, 200),
        fallback,
      });
      return fallback;
    }
    const fields = lines[1].split(",");
    const close = parseFloat(fields[6]);
    if (isNaN(close) || close < 2 || close > 6) {
      await logError("fx.stooq", "Out-of-range value", { raw: fields[6], fallback });
      return fallback;
    }
    return close;
  } catch (err) {
    if (!isBenignFrameworkError(err)) await logError("fx.stooq", err, { fallback });
    return fallback;
  }
}
