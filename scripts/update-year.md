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
3. **Refresh each numeric block from its source URL** (listed in each block's `source` field):
   - US federal brackets + standard deduction + CTC + SS wage base: IRS annual Rev Proc
   - Israel income tax brackets + Bituach Leumi: gov.il Israel Tax Authority
   - Sal Klita amounts: Nefesh B'Nefesh calculator page
   - KFF health insurance survey (September release each year)
   - State income tax + property tax: Tax Foundation annual report
   - Jewish day school tuition: Avi Chai Foundation annual survey
4. **Add import in `src/data/current.ts`**:
   ```ts
   import { YEAR_2027 } from "./years/2027";
   const YEARS = { 2026: YEAR_2026, 2027: YEAR_2027 };
   ```
5. **Flip `CURRENT_TAX_YEAR = 2027`** in `src/data/current.ts`.
6. **Update `lastReviewed` and `nextScheduledRefresh`** fields in the new year file.
7. **Run `npm run build` locally** — TS will catch any shape mismatch.
8. **Push a PR**. Vercel auto-deploys preview for human QA before merge.

## Future: automate this

Target: a GitHub Action scheduled for January 10 and March 15 each year that:
- Scrapes the five source URLs above
- Generates a draft `years/NNNN.ts` from a template + scraped numbers
- Opens a PR with the diff
- Assigns a reviewer

Until that's built, this manual checklist is the source of truth.
