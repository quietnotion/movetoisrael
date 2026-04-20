import { YEAR_2026, TaxYearData } from "./years/2026";

const YEARS: Record<number, TaxYearData> = {
  2026: YEAR_2026,
};

export const CURRENT_TAX_YEAR = 2026;

export function getYearData(year: number = CURRENT_TAX_YEAR): TaxYearData {
  return YEARS[year] ?? YEARS[CURRENT_TAX_YEAR];
}

export const CURRENT = getYearData();
