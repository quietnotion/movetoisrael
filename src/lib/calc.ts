import { STATES, StateCode } from "./states";
import { CURRENT } from "@/data/current";

export type Inputs = {
  state: StateCode;
  householdIncome: number;
  kids: number;
  homeValue?: number;
  kidsAges?: number[];
  sendsToJewishDaySchool?: boolean;
};

export type Row = {
  label: string;
  us: number;
  il: number;
  delta: number;
  note?: string;
  onlyIfKids?: boolean;
  onlyIfDaySchool?: boolean;
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
    salKlitaNis: number;
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

function kitzvatYeladimAnnualUsd(kids: number, ilsPerUsd: number): number {
  if (kids === 0) return 0;
  const rates = CURRENT.kitzvatYeladim.monthlyNisByChildOrdinal;
  const schedule = [rates.first, rates.second, rates.third, rates.fourth];
  let monthlyNis = 0;
  for (let i = 0; i < kids; i++) {
    monthlyNis += i < 4 ? schedule[i] : rates.fifthPlus;
  }
  return (monthlyNis * 12) / ilsPerUsd;
}

function arrivalBonus(kids: number, ilsPerUsd: number, kidsAges?: number[]) {
  const s = CURRENT.salKlita;
  let totalNis = s.coupleNis;
  if (kidsAges && kidsAges.length > 0) {
    for (const age of kidsAges) {
      if (age < 4) totalNis += s.perChildNisByAge.under4;
      else if (age < 18) totalNis += s.perChildNisByAge.age4to17;
      else totalNis += s.perChildNisByAge.age18to21;
    }
  } else {
    totalNis += s.perChildNisByAge.age4to17 * kids;
  }
  return {
    salKlitaUsd: Math.round(totalNis / ilsPerUsd),
    salKlitaNis: Math.round(totalNis),
    calculatorUrl: s.officialCalculatorUrl,
  };
}

export function calculate(inputs: Inputs, fxRate?: number): CalcResult {
  const { state, householdIncome, kids, homeValue = 0, kidsAges, sendsToJewishDaySchool = true } = inputs;
  const ilsPerUsd = fxRate ?? CURRENT.israel.ilsPerUsdFallback;

  const usIncomeTaxTotal = usFederalTax(householdIncome, kids) + usStateTax(householdIncome, state) + usFicaTax(householdIncome);
  const ilIncomeTaxTotal = ilIncomeTaxWithOleh(householdIncome, ilsPerUsd) + bituachLeumi(householdIncome, ilsPerUsd);

  const usHealth = usHealthCostOutOfPocket(state, kids, householdIncome);
  const usProp = usPropertyTax(homeValue, state);
  const ilArn = homeValue > 0 ? ilArnona(homeValue) : 0;
  const usSchool = sendsToJewishDaySchool ? usJewishDaySchool(kids, kidsAges) : 0;
  const ilChildAllowance = kitzvatYeladimAnnualUsd(kids, ilsPerUsd);
  const usCollege = kids * CURRENT.college.usAnnualSavingsPerKidUsd;
  const ilCollege = kids * CURRENT.college.ilAnnualSavingsPerKidUsd;

  const rows: Row[] = [
    {
      label: "Income tax + payroll",
      us: usIncomeTaxTotal,
      il: ilIncomeTaxTotal,
      delta: usIncomeTaxTotal - ilIncomeTaxTotal,
      note: `U.S. column combines federal, state, and FICA. Israel column combines income tax (with the ${Math.round((1 - CURRENT.israel.olehTaxDiscountMultiplier) * 100)}% oleh discount for the first ${CURRENT.israel.olehDiscountYearsFullBenefit} years) and Bituach Leumi, which also funds Kupat Holim universal health coverage. As a U.S. citizen you still file with the IRS, but the Foreign Earned Income Exclusion and Foreign Tax Credit usually eliminate U.S. tax owed.`,
    },
    {
      label: "Health insurance out of your paycheck",
      us: usHealth,
      il: 0,
      delta: usHealth,
      note: "In Israel, Kupat Holim coverage is already funded by Bituach Leumi in the row above. No separate premium comes out of your paycheck.",
    },
    {
      label: "Property tax (U.S.) / Arnona (Israel)",
      us: usProp,
      il: ilArn,
      delta: usProp - ilArn,
      note: homeValue > 0
        ? "Israeli Arnona is charged per square meter, based on your city and property type. We estimate it here from your home value as a rough proxy; actual amount varies by municipality."
        : "Enter your U.S. home value above to calculate property tax and Israeli Arnona. Arnona typically runs $1,500 to $2,000 per year for a standard family apartment.",
    },
    {
      label: "Private Jewish day school tuition",
      us: usSchool,
      il: 0,
      delta: usSchool,
      onlyIfKids: true,
      onlyIfDaySchool: true,
      note: "Israeli public schools are Jewish by default, with calendar, Hebrew, and Torah built in. No tuition needed to raise Jewish kids.",
    },
    {
      label: "College savings needed per year",
      us: usCollege,
      il: ilCollege,
      delta: usCollege - ilCollege,
      onlyIfKids: true,
      note: `U.S. private 4-year college all-in is roughly $250K per kid in today's dollars. Funding it from birth requires about $${CURRENT.college.usAnnualSavingsPerKidUsd.toLocaleString()}/yr/kid. Israeli public university costs around $3K/yr in tuition over 3 or 4 years, so about $${CURRENT.college.ilAnnualSavingsPerKidUsd.toLocaleString()}/yr/kid covers it.`,
    },
    {
      label: "Child allowance (Kitzvat Yeladim), paid to you",
      us: 0,
      il: -ilChildAllowance,
      delta: ilChildAllowance,
      onlyIfKids: true,
      note: "Monthly payment from Bituach Leumi to every Israeli resident parent, regardless of income. Paid to the mother's bank account. 2026 rates: 173 NIS/mo for the 1st child, 219 NIS/mo each for kids 2 through 4.",
    },
  ];

  const usTotal = usIncomeTaxTotal + usHealth + usProp + usSchool + usCollege;
  const ilTotal = ilIncomeTaxTotal + ilArn + ilCollege - ilChildAllowance;
  const usNet = householdIncome - usTotal;
  const ilNet = householdIncome - ilTotal;
  const annualDelta = ilNet - usNet;

  const notes: string[] = [
    `U.S. federal and Israel ${CURRENT.year} tax year. Last reviewed ${CURRENT.lastReviewed}.`,
    `Live USD to ILS conversion at ${ilsPerUsd.toFixed(2)}, sourced from Stooq and cached 1 hour.`,
    `Assumes a married-filing-jointly U.S. household. Single and dual-earner numbers vary but land in a similar neighborhood.`,
    `Israel income tax column reflects the ${CURRENT.israel.olehDiscountYearsFullBenefit}-year deep-discount phase of the oleh benefit. The ${CURRENT.israel.olehDiscountYearsTotal}-year total ramp brings it to the full rate over time.`,
  ];
  if (householdIncome < CURRENT.lowIncomeSupplement.thresholdUsd) {
    notes.push(
      `At your household income level, Israel also offers an income supplement (Hashlamat Hachnasa) and a negative income tax / work grant (Ma'anak Avoda) for low earners. These aren't modeled here; if they apply to you, Israel's net number is better than what's shown.`
    );
  }

  const isWorseOff = annualDelta < 0;
  let forwardFraming: string | undefined;
  if (isWorseOff) {
    if (kids === 0) {
      forwardFraming = `With no kids and no homeownership, the straight tax math runs $${Math.abs(Math.round(annualDelta)).toLocaleString()} against you on paper, because Israeli marginal rates are high. Add one child and the math flips hard. Jewish day school runs $${CURRENT.costs.jewishDaySchoolPerKidUsAvg.toLocaleString()}/yr/kid in the U.S., and college savings another $${CURRENT.college.usAnnualSavingsPerKidUsd.toLocaleString()}/yr/kid, both of which disappear in Israel. If you're thinking about family life, the math is working for you.`;
    } else {
      forwardFraming = `Your U.S. tax profile is unusually favorable and the pure tax line is close to neutral. The case for moving lives in everything else. Universal healthcare that isn't tied to your job. Kids who grow up bilingual in a Jewish-majority society. The cash Israel hands you on arrival.`;
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
    arrivalBonus: arrivalBonus(kids, ilsPerUsd, kidsAges),
    totals: {
      us: Math.round(usTotal),
      il: Math.round(ilTotal),
      delta: Math.round(usTotal - ilTotal),
    },
  };
}
