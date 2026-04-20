export const YEAR_2026 = {
  year: 2026,
  lastReviewed: "2026-04-20",
  nextScheduledRefresh: "2027-01-15",

  usFederal: {
    standardDeductionMFJ: 31500,
    childTaxCredit: 2000,
    ssWageBase: 176100,
    ssRate: 0.062,
    medicareRate: 0.0145,
    additionalMedicareThreshold: 200000,
    additionalMedicareRate: 0.009,
    feieLimit: 130000,
    bracketsMFJ: [
      { cap: 23850, rate: 0.10 },
      { cap: 96950, rate: 0.12 },
      { cap: 206700, rate: 0.22 },
      { cap: 394600, rate: 0.24 },
      { cap: 501050, rate: 0.32 },
      { cap: 751600, rate: 0.35 },
      { cap: Infinity, rate: 0.37 },
    ] as Array<{ cap: number; rate: number }>,
    source: "https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026",
  },

  israel: {
    ilsPerUsdFallback: 3.7,
    incomeTaxBracketsIls: [
      { cap: 84120, rate: 0.10 },
      { cap: 120720, rate: 0.14 },
      { cap: 193800, rate: 0.20 },
      { cap: 269280, rate: 0.31 },
      { cap: 560280, rate: 0.35 },
      { cap: 721560, rate: 0.47 },
      { cap: Infinity, rate: 0.50 },
    ] as Array<{ cap: number; rate: number }>,
    bituachLeumi: {
      lowTierMonthlyIls: 7522,
      lowRate: 0.035,
      highRate: 0.12,
      monthlyCapIls: 53970,
    },
    olehTaxDiscountMultiplier: 0.75,
    olehDiscountYearsFullBenefit: 3.5,
    olehDiscountYearsTotal: 10,
    feieYearsOfProtection: 10,
    source: "https://www.gov.il/he/departments/israel_tax_authority",
  },

  salKlita: {
    perSinglePersonUsd: 3800,
    perCoupleUsd: 6200,
    perChildUsd: 2400,
    customsExemptionYears: 3,
    arnonaDiscountYear1Percent: 0.90,
    arnonaDiscountYear2to3Percent: 0.75,
    ulpanHoursFree: 500,
    source: "https://www.nbn.org.il/life-in-israel/government-services/rights-and-benefits/sal-klita-calculator/",
  },

  nefeshBnefesh: {
    grantPerAdultUsd: 1500,
    grantPerChildUsd: 500,
    source: "https://www.nbn.org.il/aliyah-rights-and-benefits/",
  },

  college: {
    usAnnualSavingsPerKidUsd: 10000,
    ilAnnualSavingsPerKidUsd: 800,
    note: "US: average private 4-yr college ~$250K all-in, needs ~$10K/yr/kid from birth to fund. Israel: public university ~$3K/yr tuition, covered by ~$800/yr/kid savings.",
    sources: [
      "https://research.collegeboard.org/trends/college-pricing",
      "https://www.gov.il/en/departments/ministry_of_education",
    ],
  },

  costs: {
    jewishDaySchoolPerKidUsAvg: 28000,
    healthInsuranceFamilyUsAvg: 24600,
    healthInsuranceEmployeeShareWithKids: 0.25,
    healthInsuranceEmployeeShareNoKids: 0.20,
    ilArnonaBaseUsd: 1800,
    ilArnonaPerHomeValue: 0.0005,
    ilArnonaCapUsd: 4800,
    sources: [
      "https://kff.org/report-section/ehbs-2025-summary-of-findings/",
      "https://avichai.org/knowledge_base/jewish-day-school-tuition-trends/",
    ],
  },
} as const;

export type TaxYearData = typeof YEAR_2026;
