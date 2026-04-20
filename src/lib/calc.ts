import { STATES, StateCode } from "./states";
import { CURRENT } from "@/data/current";

export type Inputs = {
  state: StateCode;
  householdIncome: number;
  kids: number;
  homeValue?: number;
  mortgageBalance?: number;
  kidsAges?: number[];
};

export type Row = {
  label: string;
  us: number;
  il: number;
  delta: number;
  note?: string;
  onlyIfKids?: boolean;
};

export type CalcResult = {
  annualDelta: number;
  usNet: number;
  ilNet: number;
  rows: Row[];
  notes: string[];
  taxYear: number;
  lastReviewed: string;
  isWorseOff: boolean;
  forwardFraming?: string;
  arrivalBonus: {
    salKlitaUsd: number;
    calculatorUrl: string;
  };
  totals: { us: number; il: number; delta: number };
};

function applyBrackets(taxable: number, brackets: Array<{ cap: number; rate: number }>): number {
  let tax = 0;
  let prev = 0;
  for (const { cap, rate } of brackets) {
    if (taxable <= cap) { tax += (taxable - prev) * rate; break; }
    tax += (cap - prev) * rate;
    prev = cap;
  }
  return tax;
}

function usFederalTax(income: number, kids: number): number {
  const f = CURRENT.usFederal;
  const taxable = Math.max(0, income - f.standardDeductionMFJ);
  const ctc = f.childTaxCredit * kids;
  return Math.max(0, applyBrackets(taxable, f.bracketsMFJ as Array<{ cap: number; rate: number }>) - ctc);
}

function usFicaTax(income: number): number {
  const f = CURRENT.usFederal;
  const ss = Math.min(income, f.ssWageBase) * f.ssRate;
  const medicare = income * f.medicareRate;
  const addl = income > f.additionalMedicareThreshold
    ? (income - f.additionalMedicareThreshold) * f.additionalMedicareRate : 0;
  return ss + medicare + addl;
}

function usStateTax(income: number, state: StateCode): number {
  return income * STATES[state].effectiveRateMiddleClass;
}

function ilIncomeTaxGross(incomeUsd: number, ilsPerUsd: number): number {
  const incomeIls = incomeUsd * ilsPerUsd;
  return applyBrackets(incomeIls, CURRENT.israel.incomeTaxBracketsIls as Array<{ cap: number; rate: number }>) / ilsPerUsd;
}

function bituachLeumi(incomeUsd: number, ilsPerUsd: number): number {
  const bl = CURRENT.israel.bituachLeumi;
  const monthlyIls = (incomeUsd * ilsPerUsd) / 12;
  const low = Math.min(monthlyIls, bl.lowTierMonthlyIls) * bl.lowRate;
  const high = monthlyIls > bl.lowTierMonthlyIls
    ? (Math.min(monthlyIls, bl.monthlyCapIls) - bl.lowTierMonthlyIls) * bl.highRate : 0;
  return ((low + high) * 12) / ilsPerUsd;
}

function ilIncomeTaxWithOleh(incomeUsd: number, ilsPerUsd: number): number {
  return ilIncomeTaxGross(incomeUsd, ilsPerUsd) * CURRENT.israel.olehTaxDiscountMultiplier;
}

function usPropertyTax(homeValue: number, state: StateCode): number {
  return homeValue * STATES[state].avgPropertyTaxRate;
}

function usHealthCostOutOfPocket(state: StateCode, kids: number, income: number): number {
  const base = STATES[state].avgHealthPremiumFamily;
  const share = kids > 0 || income < 150000
    ? CURRENT.costs.healthInsuranceEmployeeShareWithKids
    : CURRENT.costs.healthInsuranceEmployeeShareNoKids;
  return Math.round((base * share) / 100) * 100;
}

function usJewishDaySchool(kids: number, kidsAges?: number[]): number {
  if (kids === 0) return 0;
  const perKid = CURRENT.costs.jewishDaySchoolPerKidUsAvg;
  if (!kidsAges || kidsAges.length === 0) return kids * perKid;
  return kidsAges.filter((a) => a >= 5 && a <= 18).length * perKid;
}

function ilArnona(homeValueUsd: number): number {
  const c = CURRENT.costs;
  if (!homeValueUsd) return c.ilArnonaBaseUsd * 1.67;
  return Math.min(c.ilArnonaCapUsd, c.ilArnonaBaseUsd + homeValueUsd * c.ilArnonaPerHomeValue);
}

function arrivalBonus(kids: number) {
  const s = CURRENT.salKlita;
  const salKlitaUsd = s.perCoupleUsd + s.perChildUsd * kids;
  return {
    salKlitaUsd: Math.round(salKlitaUsd),
    calculatorUrl: s.officialCalculatorUrl,
  };
}

export function calculate(inputs: Inputs, fxRate?: number): CalcResult {
  const { state, householdIncome, kids, homeValue = 0, kidsAges } = inputs;
  const ilsPerUsd = fxRate ?? CURRENT.israel.ilsPerUsdFallback;

  const usIncomeTaxTotal = usFederalTax(householdIncome, kids) + usStateTax(householdIncome, state) + usFicaTax(householdIncome);
  const ilIncomeTaxTotal = ilIncomeTaxWithOleh(householdIncome, ilsPerUsd) + bituachLeumi(householdIncome, ilsPerUsd);

  const usHealth = usHealthCostOutOfPocket(state, kids, householdIncome);
  const usProp = usPropertyTax(homeValue, state);
  const ilArn = homeValue > 0 ? ilArnona(homeValue) : 0;
  const usSchool = usJewishDaySchool(kids, kidsAges);
  const usCollege = kids * CURRENT.college.usAnnualSavingsPerKidUsd;
  const ilCollege = kids * CURRENT.college.ilAnnualSavingsPerKidUsd;

  const rows: Row[] = [
    {
      label: "Income tax + payroll",
      us: usIncomeTaxTotal,
      il: ilIncomeTaxTotal,
      delta: usIncomeTaxTotal - ilIncomeTaxTotal,
      note: `U.S. column combines federal + state + FICA. Israel column combines income tax (with ${Math.round((1 - CURRENT.israel.olehTaxDiscountMultiplier) * 100)}% oleh discount, first ${CURRENT.israel.olehDiscountYearsFullBenefit} years) + Bituach Leumi. As a U.S. citizen you still file with the IRS, but the Foreign Earned Income Exclusion and Foreign Tax Credit usually eliminate U.S. tax owed.`,
    },
    {
      label: "Health insurance (out of your paycheck)",
      us: usHealth,
      il: 0,
      delta: usHealth,
      note: "Israel's universal healthcare (Kupat Holim) is funded by Bituach Leumi above. You pay nothing extra out of pocket for basic coverage.",
    },
    {
      label: "Property tax / Arnona",
      us: usProp,
      il: ilArn,
      delta: usProp - ilArn,
    },
    {
      label: "Private Jewish day school",
      us: usSchool,
      il: 0,
      delta: usSchool,
      onlyIfKids: true,
      note: "Israeli public schools are Jewish by default — calendar, Hebrew, Torah. No tuition required to raise Jewish kids.",
    },
    {
      label: "College savings (needed per year)",
      us: usCollege,
      il: ilCollege,
      delta: usCollege - ilCollege,
      onlyIfKids: true,
      note: `U.S. private 4-year college all-in is roughly $250K per kid in today's dollars; funding it from birth requires ~$${CURRENT.college.usAnnualSavingsPerKidUsd.toLocaleString()}/yr/kid. Israeli public university costs ~$3K/yr in tuition and takes 3–4 years; a modest ~$${CURRENT.college.ilAnnualSavingsPerKidUsd.toLocaleString()}/yr/kid covers it.`,
    },
  ];

  const usTotal = usIncomeTaxTotal + usHealth + usProp + usSchool + usCollege;
  const ilTotal = ilIncomeTaxTotal + ilArn + ilCollege;
  const usNet = householdIncome - usTotal;
  const ilNet = householdIncome - ilTotal;
  const annualDelta = ilNet - usNet;

  const notes: string[] = [
    `U.S. federal + Israel ${CURRENT.year} tax year, last reviewed ${CURRENT.lastReviewed}.`,
    `Live USD→ILS conversion at ${ilsPerUsd.toFixed(3)} (Stooq, cached 1 hour).`,
    `Married-filing-jointly U.S. household assumed. Single / dual-earner numbers vary but land in a similar neighborhood.`,
    `Israel income tax column reflects the ${CURRENT.israel.olehDiscountYearsFullBenefit}-year deep-discount phase of the oleh benefit; the ${CURRENT.israel.olehDiscountYearsTotal}-year total ramp brings it to the full rate over time.`,
  ];

  const isWorseOff = annualDelta < 0;
  let forwardFraming: string | undefined;
  if (isWorseOff) {
    if (kids === 0) {
      forwardFraming = `With no kids and no homeownership, the straight tax math runs $${Math.abs(Math.round(annualDelta)).toLocaleString()} against you on paper — Israeli marginal rates are high. Add one child and the math flips hard: Jewish day school runs $${CURRENT.costs.jewishDaySchoolPerKidUsAvg.toLocaleString()}/yr/kid in the U.S. and college savings another $${CURRENT.college.usAnnualSavingsPerKidUsd.toLocaleString()}/yr/kid, both of which disappear in Israel. If you're thinking about family life, the math is working for you.`;
    } else {
      forwardFraming = `Your U.S. tax profile is unusually favorable and the pure tax line is close to neutral. The case for moving lives in everything else — universal healthcare that isn't tied to your job, kids who grow up bilingual in a Jewish-majority society, and the cash Israel hands you on arrival.`;
    }
  }

  return {
    annualDelta: Math.round(annualDelta),
    usNet: Math.round(usNet),
    ilNet: Math.round(ilNet),
    rows: rows.map((r) => ({ ...r, us: Math.round(r.us), il: Math.round(r.il), delta: Math.round(r.delta) })),
    notes,
    taxYear: CURRENT.year,
    lastReviewed: CURRENT.lastReviewed,
    isWorseOff,
    forwardFraming,
    arrivalBonus: arrivalBonus(kids),
    totals: {
      us: Math.round(usTotal),
      il: Math.round(ilTotal),
      delta: Math.round(usTotal - ilTotal),
    },
  };
}
