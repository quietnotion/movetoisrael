import { NextRequest, NextResponse } from "next/server";
import { calculate, Inputs } from "@/lib/calc";
import { getUsdIlsRate } from "@/lib/fx";
import { StateCode, STATES } from "@/lib/states";
import { incrementCalculation, tryConsumeTrackBudget } from "@/lib/counter";
import { logError } from "@/lib/alert";

export async function GET(req: NextRequest) {
  try {
    return await handle(req);
  } catch (err) {
    await logError("api.calculate", err, { url: req.nextUrl.toString() });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

async function handle(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const state = (p.get("state") || "NY") as StateCode;
  const income = parseInt(p.get("income") || "0", 10);
  const rawKids = p.get("kids");
  const kids = rawKids === null ? 0 : parseInt(rawKids, 10);
  const rawHomeValue = p.get("homeValue");
  const homeValue = rawHomeValue ? parseInt(rawHomeValue, 10) : undefined;
  const dayschoolParam = p.get("dayschool");
  const sendsToJewishDaySchool = dayschoolParam === null ? undefined : dayschoolParam !== "0" && dayschoolParam !== "false";

  if (!STATES[state]) {
    return NextResponse.json({ error: "Invalid state code" }, { status: 400 });
  }
  if (!Number.isFinite(income) || income < 10000 || income > 10000000) {
    return NextResponse.json({ error: "Income must be between 10,000 and 10,000,000" }, { status: 400 });
  }
  if (!Number.isFinite(kids) || kids < 0 || kids > 20) {
    return NextResponse.json({ error: "Kids must be a whole number between 0 and 20" }, { status: 400 });
  }
  if (homeValue !== undefined && (!Number.isFinite(homeValue) || homeValue < 0 || homeValue > 100000000)) {
    return NextResponse.json({ error: "homeValue must be between 0 and 100,000,000" }, { status: 400 });
  }

  const inputs: Inputs = { state, householdIncome: income, kids, homeValue, sendsToJewishDaySchool };
  const fxRate = await getUsdIlsRate();
  const result = calculate(inputs, fxRate);

  const track = p.get("track");
  if (track === "1") {
    const ip = getClientIp(req);
    const allowed = await tryConsumeTrackBudget(ip);
    if (allowed) {
      await incrementCalculation();
    }
  }

  return NextResponse.json({
    ...result,
    fxRate,
    inputs,
    disclaimer:
      "Estimates only. Based on U.S. and Israel 2026 tax year published rates. Not tax advice. Consult an accountant licensed in both jurisdictions.",
  });
}
