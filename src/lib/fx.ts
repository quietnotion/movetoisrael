import { CURRENT } from "@/data/current";

export async function getUsdIlsRate(): Promise<number> {
  const fallback = CURRENT.israel.ilsPerUsdFallback;
  try {
    const res = await fetch("https://stooq.com/q/l/?s=usdils&f=sd2t2ohlcv&h&e=csv", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      console.error(`[fx] Stooq non-OK status: ${res.status}, using fallback ${fallback}`);
      return fallback;
    }
    const text = await res.text();
    const lines = text.trim().split("\n");
    if (lines.length < 2) {
      console.error(`[fx] Stooq response malformed (${lines.length} lines), using fallback ${fallback}`);
      return fallback;
    }
    const fields = lines[1].split(",");
    const close = parseFloat(fields[6]);
    if (isNaN(close) || close < 2 || close > 6) {
      console.error(`[fx] Stooq returned out-of-range value ${fields[6]}, using fallback ${fallback}`);
      return fallback;
    }
    return close;
  } catch (err) {
    console.error(`[fx] Stooq fetch failed:`, err, `using fallback ${fallback}`);
    return fallback;
  }
}
