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

export type Breakdown = {
  label: string;
  us: number;
  il: number;
  note?: string;
};

export type CalcResult = {
  annualDelta: number;
  usNet: number;
  ilNet: number;
  breakdown: Breakdown[];
  notes: string[];
  taxYear: number;
  lastReviewed: string;
  isWorseOff: boolean;
  forwardFraming?: string;
  salKlitaEstimateUsd: number;
};

function applyBrackets(taxable: number, brackets: Array<{ cap: number; rate: number }>): number {
  let tax = 0;
  let prev = 0;
  for (const { cap, rate } of brackets) {
    if (taxable <= cap) {
      tax += (taxable - prev) * rate;
      break;
    }
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
    ? (income - f.additionalMedicareThreshold) * f.additionalMedicareRate
    : 0;
  return ss + medicare + addl;
}

function usStateTax(income: number, state: StateCode): number {
  return income * STATES[state].effectiveRateMiddleClass;
}

function ilIncomeTaxGross(incomeUsd: number, ilsPerUsd: number): number {
  const incomeIls = incomeUsd * ilsPerUsd;
  const taxIls = applyBrackets(
    incomeIls,
    CURRENT.israel.incomeTaxBracketsIls as Array<{ cap: number; rate: number }>
  );
  return taxIls / ilsPerUsd;
}

function bituachLeumi(incomeUsd: number, ilsPerUsd: number): number {
  const bl = CURRENT.israel.bituachLeumi;
  const monthlyIls = (incomeUsd * ilsPerUsd) / 12;
  const low = Math.min(monthlyIls, bl.lowTierMonthlyIls) * bl.lowRate;
  const high = monthlyIls > bl.lowTierMonthlyIls
    ? (Math.min(monthlyIls, bl.monthlyCapIls) - bl.lowTierMonthlyIls) * bl.highRate
    : 0;
  return ((low + high) * 12) / ilsPerUsd;
}

function ilIncomeTaxWithOlehBenefits(incomeUsd: number, ilsPerUsd: number): number {
  return ilIncomeTaxGross(incomeUsd, ilsPerUsd) * CURRENT.israel.olehTaxDiscountMultiplier;
}

function usPropertyTax(homeValue: number, state: StateCode): number {
  return homeValue * STATES[state].avgPropertyTaxRate;
}

function usHealthPremium(state: StateCode, kids: number, income: number): number {
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

function salKlitaFirstYear(kids: number): number {
  const s = CURRENT.salKlita;
  return s.perCoupleUsd + s.perChildUsd * kids;
}

export function calculate(inputs: Inputs, fxRate?: number): CalcResult {
  const { state, householdIncome, kids, homeValue = 0, kidsAges } = inputs;
  const ilsPerUsd = fxRate ?? CURRENT.israel.ilsPerUsdFallback;

  const usFed = usFederalTax(householdIncome, kids);
  const usFica = usFicaTax(householdIncome);
  const usState = usStateTax(householdIncome, state);
  const usHealth = usHealthPremium(state, kids, householdIncome);
  const usPropTax = usPropertyTax(homeValue, state);
  const usSchool = usJewishDaySchool(kids, kidsAges);

  const ilTax = ilIncomeTaxWithOlehBenefits(householdIncome, ilsPerUsd);
  const ilBL = bituachLeumi(householdIncome, ilsPerUsd);
  const ilArn = ilArnona(homeValue);

  const usTotal = usFed + usFica + usState + usHealth + usPropTax + usSchool;
  const ilTotal = ilTax + ilBL + ilArn;

  const usNet = householdIncome - usTotal;
  const ilNet = householdIncome - ilTotal;
  const annualDelta = ilNet - usNet;

  const breakdown: Breakdown[] = [
    {
      label: "Federal income tax",
      us: usFed,
      il: 0,
      note: "As a U.S. citizen you still file with the IRS. The Foreign Earned Income Exclusion and Foreign Tax Credit usually eliminate U.S. tax owed.",
    },
    { label: "State income tax", us: usState, il: 0 },
    { label: "Payroll (FICA / Bituach Leumi)", us: usFica, il: ilBL },
    {
      label: "Israel income tax",
      us: 0,
      il: ilTax,
      note: `Includes ${Math.round((1 - CURRENT.israel.olehTaxDiscountMultiplier) * 100)}% oleh immigrant discount (first ~${CURRENT.israel.olehDiscountYearsFullBenefit} years). Phased back to full rate across ${CURRENT.israel.olehDiscountYearsTotal} years.`,
    },
    {
      label: "Health insurance premium",
      us: usHealth,
      il: 0,
      note: "Israel's universal healthcare (Kupat Holim) is funded by Bituach Leumi above. No separate employer-sponsored premium.",
    },
    { label: "Property tax / Arnona", us: usPropTax, il: homeValue > 0 ? ilArn : 0 },
    {
      label: "Private Jewish day school tuition",
      us: usSchool,
      il: 0,
      note: "Israeli public schools are Jewish by default. No tuition required to raise Jewish kids.",
    },
  ];

  const notes: string[] = [
    `Based on U.S. federal and Israel ${CURRENT.year} tax year. Data last reviewed ${CURRENT.lastReviewed}.`,
    `USD→ILS conversion at ${ilsPerUsd.toFixed(3)} (live via Stooq, hourly).`,
    `Assumes a married-filing-jointly U.S. household for simplicity.`,
    `Israel column includes the ${CURRENT.israel.olehDiscountYearsTotal}-year oleh benefit schedule.`,
  ];

  const salKlitaEstimateUsd = salKlitaFirstYear(kids);

  const isWorseOff = annualDelta < 0;
  let forwardFraming: string | undefined;
  if (isWorseOff) {
    if (kids === 0) {
      forwardFraming = `With no kids today and no homeownership assumed, the pure tax math runs $${Math.abs(Math.round(annualDelta)).toLocaleString()} against you. Add one child to the picture — Jewish day school averages $${CURRENT.costs.jewishDaySchoolPerKidUsAvg.toLocaleString()}/kid/year in the U.S., $0 in Israel — and the math flips. The intangibles below are also where the case lives for someone with your profile.`;
    } else {
      forwardFraming = `Your current tax situation is unusually favorable and the financial case is close to neutral on paper. Look at the intangibles — Israel's top-10 happiness ranking, universal healthcare that's not tied to your job, kids growing up bilingual in a Jewish-majority society. That's the real case for your profile.`;
    }
  }

  return {
    annualDelta: Math.round(annualDelta),
    usNet: Math.round(usNet),
    ilNet: Math.round(ilNet),
    breakdown: breakdown.map((b) => ({ ...b, us: Math.round(b.us), il: Math.round(b.il) })),
    notes,
    taxYear: CURRENT.year,
    lastReviewed: CURRENT.lastReviewed,
    isWorseOff,
    forwardFraming,
    salKlitaEstimateUsd,
  };
}
