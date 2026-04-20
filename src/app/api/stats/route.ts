import { NextResponse } from "next/server";
import { getTotalCount, getMonthCount, getAllMonthlyCounts } from "@/lib/counter";
import { logError } from "@/lib/alert";

export async function GET() {
  try {
    const [total, thisMonth, monthly] = await Promise.all([
      getTotalCount(),
      getMonthCount(),
      getAllMonthlyCounts(),
    ]);
    return NextResponse.json({
      total,
      thisMonth,
      monthly,
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    await logError("api.stats", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
