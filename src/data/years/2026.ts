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
    // Source: Misrad Haklita published rates (2025, indexed annually).
    // Anchors confirmed from multiple sources:
    //   - Single oleh (age 22+): 21,194 NIS
    //   - Ordinary married couple (no kids): 37,802 NIS
    //   - Family range: 19,829 to 46,513 NIS
    // Child supplements are paid in three age brackets per the gov.il
    // spec. Per-bracket amounts below are interpolated from the published
    // couple baseline and max family figures; official NBN calculator is
    // authoritative for edge cases.
    singleOlehNis: 21194,
    coupleNis: 37802,
    perChildNisByAge: {
      under4: 3000,
      age4to17: 4500,
      age18to21: 6000,
    },
    customsExemptionYears: 3,
    arnonaDiscountYear1Percent: 0.90,
    arnonaDiscountYear2to3Percent: 0.75,
    ulpanHoursFree: 500,
    officialCalculatorUrl: "https://www.nbn.org.il/life-in-israel/government-services/rights-and-benefits/sal-klita-calculator/",
    source: "https://www.gov.il/en/departments/general/absorption_basket",
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

  kitzvatYeladim: {
    // Bituach Leumi child allowance, paid monthly to every Israeli resident
    // parent regardless of income. 2026 rates from btl.gov.il.
    monthlyNisByChildOrdinal: {
      first: 173,
      second: 219,
      third: 219,
      fourth: 219,
      fifthPlus: 173,
    },
    source: "https://www.btl.gov.il/English%20Homepage/Benefits/Children/Pages/Rates%20of%20child%20allowance.aspx",
  },

  lowIncomeSupplement: {
    // Ma'anak Avoda (Work Grant / negative income tax) and Hashlamat Hachnasa
    // (income supplement) kick in for low earners. Not modeled directly
    // because they're narrow edge cases for our audience; we surface a note
    // when household income falls below this USD threshold.
    thresholdUsd: 50000,
    source: "https://www.btl.gov.il/English%20Homepage/Benefits/",
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
