# Annual Tax-Year Refresh Checklist

This site displays numbers for a specific tax year. Keep it evergreen by running this checklist
every January, once published sources for the new year are available.

## How the data is structured

All year-specific numbers live in one file per year:
- `src/data/years/2026.ts` — frozen snapshot
- `src/data/years/2027.ts` — next year (create by copying 2026.ts)
- `src/data/current.ts` — exports `CURRENT_TAX_YEAR` — the single dial to flip

The UI and the calculation engine both read through `src/data/current.ts`. There are **no
hardcoded numbers** in `src/lib/calc.ts` or anywhere else.

## Steps to roll to the next year

1. **Create next year's file**: `cp src/data/years/2026.ts src/data/years/2027.ts`
2. **Update the `year` field** at top of the new file.
3. **Refresh every numeric block** from the source URL cited on each block's `source` field. Categories:

   ### Tax and government figures (must be refreshed from primary sources each January)
   - US federal brackets, standard deduction, CTC, SS wage base, FEIE limit: IRS annual Rev Proc
   - Israel income tax brackets: gov.il Israel Tax Authority
   - Bituach Leumi rates and caps: bituachleumi.gov.il
   - Sal Klita amounts (single, couple, per child by age bracket): Misrad Haklita published rates at gov.il. Confirmed 2025 anchor values: single oleh 21,194 NIS; ordinary married couple 37,802 NIS; family range 19,829–46,513 NIS.
   - Oleh tax benefit schedule: Israel Tax Authority oleh chadash page

   ### Cost figures that drift with inflation (review for CPI adjustment each January, whether or not a new survey has dropped)
   - Jewish day school tuition average: latest Prizmah tuition survey, else Avi Chai. Apply CPI if no new survey available.
   - College savings target per kid: College Board Trends in College Pricing. Adjust for prior year's CPI if the new release is not yet out.
   - Health insurance family premium by state: KFF Employer Health Benefits Survey (September release). CPI-adjust if needed.
   - US state property tax effective rates: Tax Foundation State Business Tax Climate Index. CPI-adjust if no new release.
   - Israeli arnona baseline estimate: review Jerusalem and Tel Aviv municipal rate tables; apply CPI otherwise.

4. **Add import in `src/data/current.ts`**:
   ```ts
   import { YEAR_2027 } from "./years/2027";
   const YEARS = { 2026: YEAR_2026, 2027: YEAR_2027 };
   ```
5. **Flip `CURRENT_TAX_YEAR = 2027`** in `src/data/current.ts`.
6. **Update `lastReviewed` and `nextScheduledRefresh`** fields in the new year file.
7. **Run `npm run build` locally**. TS will catch any shape mismatch.
8. **Push a PR**. Vercel auto-deploys preview for human QA before merge.

## How we enforce this cadence

A GitHub Action runs on January 10 each year and opens an issue titled "Annual tax-year refresh for {YEAR}" with this checklist pre-populated. A follow-up runs March 15 as a second reminder if the issue is still open. The Action lives at `.github/workflows/annual-refresh-reminder.yml` (wire this up when we set up the repo's GitHub Actions).

## Future: automate data fetching

Target a second GitHub Action scheduled January 10 + March 15 each year that:
- Scrapes the source URLs listed above
- Generates a draft `years/NNNN.ts` from a template plus scraped numbers
- Opens a PR with the diff
- Assigns Ross as reviewer

Until that's built, this manual checklist is the source of truth and the reminder Action above is what keeps it honest.
