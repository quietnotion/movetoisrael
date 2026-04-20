export async function getUsdIlsRate(): Promise<number> {
  try {
    const res = await fetch("https://stooq.com/q/l/?s=usdils&f=sd2t2ohlcv&h&e=csv", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return 3.7;
    const text = await res.text();
    const lines = text.trim().split("\n");
    if (lines.length < 2) return 3.7;
    const fields = lines[1].split(",");
    const close = parseFloat(fields[6]);
    if (isNaN(close) || close < 2 || close > 6) return 3.7;
    return close;
  } catch {
    return 3.7;
  }
}
