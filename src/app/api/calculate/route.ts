import { NextRequest, NextResponse } from "next/server";
import { calculate, Inputs } from "@/lib/calc";
import { getUsdIlsRate } from "@/lib/fx";
import { StateCode, STATES } from "@/lib/states";

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const state = (p.get("state") || "NY") as StateCode;
  const income = parseInt(p.get("income") || "0", 10);
  const kids = parseInt(p.get("kids") || "0", 10);
  const homeValue = p.get("homeValue") ? parseInt(p.get("homeValue")!, 10) : undefined;
  const mortgageBalance = p.get("mortgageBalance") ? parseInt(p.get("mortgageBalance")!, 10) : undefined;

  if (!STATES[state]) {
    return NextResponse.json({ error: "Invalid state code" }, { status: 400 });
  }
  if (!income || income < 10000 || income > 10000000) {
    return NextResponse.json({ error: "Income must be between 10,000 and 10,000,000" }, { status: 400 });
  }

  const inputs: Inputs = { state, householdIncome: income, kids, homeValue, mortgageBalance };
  const fxRate = await getUsdIlsRate();
  const result = calculate(inputs, fxRate);

  return NextResponse.json({
    ...result,
    fxRate,
    inputs,
    disclaimer:
      "Estimates only. Based on U.S. and Israel 2026 tax year published rates. Not tax advice. Consult an accountant who handles both jurisdictions (e.g. Philip Stein, Dray & Dray, Israel US Tax).",
  });
}
