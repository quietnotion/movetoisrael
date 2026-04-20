# movetoisrael.fyi — project documentation

A free, open-source calculator for Americans weighing a move to Israel. Takes state, household income, kids, and day-school preference; returns a straight-dollars comparison of take-home income in both countries, with intangibles, arrival cash, and ongoing benefits on top.

This document is the public source of truth for how the site is built and kept evergreen. Operational specifics (cron paths, server hostnames, channel IDs, DNS records, Vercel/Upstash resource identifiers) live in a private `OPERATIONS.md` that is gitignored.

## The one-minute summary

- **Live site:** https://movetoisrael.fyi
- **Repo:** https://github.com/quietnotion/movetoisrael (public)
- **Hosting:** Vercel Hobby (free). Code lives on GitHub, Vercel builds on every push to `main` and serves from its global edge network.
- **Domain:** `.fyi` TLD
- **Data layer:** Upstash Redis (via Vercel Marketplace integration, free tier) for the public usage counter
- **Analytics:** Google Analytics 4
- **Annual cost:** domain renewal only. Everything else is free-tier.
- **Alerting:** server-side errors post to a private Slack channel

## Architecture

### Frontend + backend (single deployment)

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4. Deployed to Vercel. The home page is server-rendered on every request (`dynamic = "force-dynamic"`) so the counter and FX rate are always fresh.

```
src/
  app/
    layout.tsx            Metadata, font loading, GA4, JSON-LD schemas
    page.tsx              Home page: hero, form, intangibles, FAQ, footer
    Calculator.tsx        Client component: form state, live calc, counter ping
    FlipCounter.tsx       Client component: split-flap counter with 60s polling
    Icons.tsx             Inline SVG icons for intangible cards
    opengraph-image.tsx   Edge-rendered 1200x630 social share image
    sitemap.ts            Generates /sitemap.xml for search engines
    globals.css           Tailwind imports + keyframes + input resets
    api/
      calculate/route.ts  Calculation endpoint (also increments counter)
      stats/route.ts      Read-only counter stats endpoint
  data/
    current.ts            Exports CURRENT_TAX_YEAR + getYearData()
    years/
      2026.ts             Frozen snapshot of all 2026 numbers
  lib/
    calc.ts               Pure calculation engine (no external I/O)
    states.ts             U.S. state tax + property tax + health premium data
    fx.ts                 Stooq USD/ILS fetcher with fallback
    counter.ts            Upstash Redis increment / read helpers, rate limiter
    alert.ts              Slack chat.postMessage error alerter with throttle
.github/
  workflows/
    annual-refresh-reminder.yml   Opens Jan 10 issue, bumps Mar 15
    data-refresh-notify.yml       Alerts when tax-year data files change on main
scripts/
  update-year.md          Manual checklist for the annual tax-year refresh
public/
  robots.txt              Permissive for GPTBot, ClaudeBot, PerplexityBot, etc
  llms.txt                LLM-friendly description + API usage guide
```

### External dependencies

| Service | Purpose | Tier | Fail-safe |
|---------|---------|------|-----------|
| Upstash Redis | Public usage counter + rate limiting | Free | Counter falls back to 0; page still works |
| Stooq USD/ILS CSV | Live FX rate (cached 1 hour) | Free, no auth | Falls back to hardcoded value in year data |
| Google Analytics 4 | Traffic analytics | Free | Script loads async; site works if GA is down |
| Slack Web API | Server-side error alerts + monthly reports | Free | Failures `console.error` only (no loop) |
| GitHub Actions | Annual refresh reminder, data-change notifier | Free | |

## Data model

### Tax-year data

Every year-specific number lives in exactly one file: `src/data/years/{YYYY}.ts`. The shape is `TaxYearData` and the fields are:

- `usFederal`: brackets, standard deduction, CTC, FICA rates, FEIE limit, source URL (IRS)
- `israel`: ILS fallback, income tax brackets (NIS), Bituach Leumi rates, oleh discount schedule, source URL
- `salKlita`: single / couple baseline amounts + per-child by age bracket (in NIS), NBN calculator link, gov.il source
- `college`: annual savings target per kid, U.S. vs Israel
- `kitzvatYeladim`: monthly NIS amounts by child ordinal (1st / 2nd–4th / 5th+), btl.gov.il source
- `lowIncomeSupplement`: threshold and source (Ma'anak Avoda / Hashlamat Hachnasa)
- `costs`: Jewish day school tuition, U.S. health premium share, Israeli arnona baseline

`src/data/current.ts` exports `CURRENT_TAX_YEAR` and `CURRENT` (the resolved year data). All UI copy, the calc engine, the FAQ, and the footer pull from `CURRENT`. There are **no hardcoded tax numbers anywhere else in the codebase.**

### Counter state

Keys in Upstash:

- `mti:calc:total` — monotonically incrementing lifetime count
- `mti:calc:month:YYYY-MM` — per-month count, incremented alongside total
- `mti:rate:track:{ip}` — hourly per-IP rate limit bucket (5 tracked calcs/hr/IP)

`/api/calculate?track=1` bumps the counter keys, but only if the per-IP budget has remaining quota. `/api/stats` returns `{ total, thisMonth, monthly }`.

## Error handling and monitoring

The rule: **nothing fails silently on the server.** Every external call or risky operation routes through `src/lib/alert.ts`, which posts to a private Slack channel.

### The alert pipeline

`logError(area, err, context?)`:
1. `console.error` the full stack (goes to Vercel runtime logs)
2. Build a Slack blocks payload with the error, context, stack, and timestamp
3. Post to Slack via `chat.postMessage`
4. 30-minute in-memory dedup keyed on `area + first 80 chars of error message` so a transient issue doesn't spam
5. If Slack itself is unreachable, fall back to `console.error` only (no retry loop)

A `isBenignFrameworkError()` filter suppresses known Next.js framework-level chatter (Dynamic server usage, etc.) that isn't a real failure.

Client-side failures (FlipCounter poll, Calculator tracking ping) `console.warn` only. They're UI-refresh noise, not real breakage, and would spam if wired to Slack.

## Evergreen refresh process

The goal: keep the calculator accurate year over year without ongoing babysitting.

### The annual rollover

On January 10, a GitHub Action fires the `annual-refresh-reminder` workflow:

1. Creates an issue titled "Annual tax-year refresh for YYYY" with a pre-filled checklist
2. Posts a Slack alert with the issue link

To roll the data, follow the checklist in `scripts/update-year.md`:

1. `cp src/data/years/2026.ts src/data/years/2027.ts`
2. Update every numeric block by visiting each source URL cited in the block
3. Split into **primary-source refreshes** (IRS, Israel Tax Authority, Bituach Leumi, Misrad Haklita, oleh benefits) and **inflation reviews** (Jewish day school tuition, college savings, KFF health premium, Tax Foundation property tax, arnona baseline)
4. Apply CPI adjustment to cost-of-living figures if no new annual survey has dropped yet
5. Update `lastReviewed` and `nextScheduledRefresh` in the new year file
6. Add the import to `src/data/current.ts` and flip `CURRENT_TAX_YEAR`
7. Push a PR; Vercel auto-deploys a preview for human QA before merge

On March 15, if the issue is still open, the Action bumps it with a second Slack alert.

### Live data

FX rate and the usage counter are fetched live at render time and don't require manual refresh. Sal Klita amounts are computed live from the stored NIS base rates × current FX.

## Security posture

- Input validation on `/api/calculate`: state whitelist, income bounded 10K–10M, kids bounded 0–20, homeValue bounded 0–100M
- Per-IP rate limit on the `track=1` counter increment (5/hr)
- Security headers via `next.config.ts`: CSP, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy, HSTS (Vercel default)
- `X-Powered-By` header suppressed
- No client-side secrets. All sensitive env vars (Redis, Slack) are server-side only
- `.env.local` and `OPERATIONS.md` are gitignored
- `npm audit` clean; Dependabot wired up for weekly PRs

## Deployment pipeline

Push to `main` → Vercel detects via GitHub integration → Vercel builds Next.js (Turbopack), runs TypeScript, generates static assets → deployment goes live at `movetoisrael.fyi`.

`www.movetoisrael.fyi` redirects to apex via a `next.config.ts` edge redirect rule.

## SEO and discoverability

- `robots.txt` explicitly allows GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot
- `/llms.txt` describes the site and the API endpoint for AI agents
- `/sitemap.xml` auto-generated by `src/app/sitemap.ts`
- JSON-LD in `layout.tsx`: `WebApplication` + `FAQPage` for rich results
- OG card at `/opengraph-image` (1200×630, Next.js ImageResponse on the edge)
- `nofollow noopener` on every outbound citation link to conserve link credit
- Submitted to Google Search Console, Bing Webmaster, and IndexNow

## Honest limitations

- **Client-side counter ping can be missed** by ad-blockers or slow bouncers. This undercounts real visitors. GA4 is the more accurate visitor number; the on-page counter is social proof.
- **Upstash free tier caps** at 500K cmds/mo. Realistic visitor ceiling is quite high but not unbounded.
- **FX rate cached 1 hour** — not real-time. For a calculator this is fine; day-to-day moves rarely shift the big number meaningfully.
- **Arnona estimate** uses home value as a proxy for square meters, which isn't how municipalities actually charge. The per-row note tells the user this.
- **CPI inflation adjustments** in the annual rollover are manual; no automated scraper yet for IRS Rev Proc / KFF / Tax Foundation.
- **Nothing is translated to Hebrew.** Audience is American English speakers by design.
