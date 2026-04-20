# movetoisrael.fyi — project documentation

A free, open-source calculator for Americans weighing a move to Israel. Takes state, household income, kids, and day-school preference; returns a straight-dollars comparison of take-home income in both countries, with intangibles, arrival cash, and ongoing benefits on top.

This document is the single source of truth for how the site is built, deployed, monitored, and kept evergreen. It is written so that someone (or a future Claude session) can pick up the project cold and operate it.

## The one-minute summary

- **Live site:** https://movetoisrael.fyi
- **Repo:** https://github.com/quietnotion/movetoisrael (public)
- **Hosting:** Vercel Hobby (free). Code lives on GitHub, Vercel builds on every push to `main` and serves from its global edge network.
- **Domain:** Porkbun, `.fyi` TLD, $5.66/year flat renewal
- **Data layer:** Upstash Redis (via Vercel Marketplace integration, free tier) for the public usage counter
- **Analytics:** Google Analytics 4 (property `movetoisrael.fyi`, Measurement ID `G-0J1RG51RJC`)
- **Annual cost:** $5.66 domain renewal. Everything else is free-tier.
- **Alerting channel:** Slack `#movetoisrael` (ID `C0ATWQCKUDT`) in the Quiet Notion workspace

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
    counter.ts            Upstash Redis increment / read helpers
    alert.ts              Slack chat.postMessage error alerter with throttle
.github/
  workflows/
    annual-refresh-reminder.yml   GitHub Action: opens Jan 10 issue, bumps Mar 15
scripts/
  update-year.md          Manual checklist for the annual tax-year refresh
public/
  robots.txt              Permissive for GPTBot, ClaudeBot, PerplexityBot, etc
  llms.txt                LLM-friendly description + API usage guide
  <indexnow-key>.txt      IndexNow verification file for Bing / Yandex / Naver
```

### External dependencies

| Service | Purpose | Tier | Fail-safe |
|---------|---------|------|-----------|
| Upstash Redis (via Vercel Marketplace) | Public usage counter | Free (256 MB, 500K cmds/mo) | Counter falls back to 0; page still works |
| Stooq USD/ILS CSV | Live FX rate (cached 1 hour) | Free, no auth | Falls back to `CURRENT.israel.ilsPerUsdFallback = 3.00` |
| Google Analytics 4 | Traffic analytics | Free | Script loads async; site works if GA is down |
| Slack Web API (`chat.postMessage`) | Error alerts + monthly reports + GitHub notifier | Free (QN Admin CLI bot) | Failures console.error only (no loop) |
| GitHub Actions | Annual refresh reminder, repo CI | Free (public repo) | |
| GitHub REST API | Issue poller (cron on jobnexus reads it) | Free unauth (60 req/hr, well within 96 polls/day) | Cron alerts Slack if API errors |

## Data model

### Tax-year data

Every year-specific number lives in exactly one file: `src/data/years/{YYYY}.ts`. The shape is `TaxYearData` and the fields are:

- `usFederal`: brackets, standard deduction, CTC, FICA rates, FEIE limit, source URL (IRS)
- `israel`: ILS fallback, income tax brackets (NIS), Bituach Leumi rates, oleh discount schedule, source URL
- `salKlita`: single / couple baseline amounts + per-child by age bracket (in NIS), NBN calculator link, gov.il source
- `nefeshBnefesh`: grants (currently zero; NBN provides services, not cash, per NBN's own site)
- `college`: annual savings target per kid, U.S. vs Israel
- `kitzvatYeladim`: monthly NIS amounts by child ordinal (1st / 2nd–4th / 5th+), btl.gov.il source
- `lowIncomeSupplement`: threshold and source (Ma'anak Avoda / Hashlamat Hachnasa)
- `costs`: Jewish day school tuition, U.S. health premium share, Israeli arnona baseline

`src/data/current.ts` exports `CURRENT_TAX_YEAR` and `CURRENT` (the resolved year data). All UI copy, the calc engine, the FAQ, and the footer pull from `CURRENT`. There are **no hardcoded tax numbers anywhere else in the codebase.**

### Counter state (Upstash Redis)

Two key patterns:

- `mti:calc:total` — monotonically incrementing lifetime count
- `mti:calc:month:YYYY-MM` — per-month count, incremented alongside total

`/api/calculate?track=1` bumps both keys. `/api/stats` returns `{ total, thisMonth, monthly: { "YYYY-MM": N, ... } }`.

## Error handling and monitoring

The rule: **nothing fails silently on the server.** Every external call or risky operation routes through `src/lib/alert.ts`, which posts to Slack `#movetoisrael`.

### The alert pipeline

`logError(area, err, context?)`:
1. `console.error` the full stack (goes to Vercel runtime logs)
2. Build a Slack blocks payload with the error, context, stack, and timestamp
3. Post to Slack via `chat.postMessage` using `SLACK_ADMIN_TOKEN` (QN Admin CLI bot)
4. 30-minute in-memory dedup keyed on `area + first 80 chars of error message` so a transient issue doesn't spam
5. If Slack itself is unreachable, fall back to `console.error` only (no retry loop)

### What's wired up

| Code path | On failure | Benign-error filter |
|-----------|------------|---------------------|
| `fx.getUsdIlsRate` | `logError("fx.stooq", ...)` + fallback to 3.00 | Ignores Next.js "Dynamic server usage" framework chatter |
| `counter.getTotalCount` etc. | `logError("counter.getTotal", ...)` + return 0 | Same filter |
| `counter.incrementCalculation` | `logError("counter.incr", ...)` + return 0 | No filter (real failures should page) |
| `api/calculate` (top-level) | `logError("api.calculate", ...)` + HTTP 500 | Outer try/catch catches anything unhandled |
| `api/stats` (top-level) | `logError("api.stats", ...)` + HTTP 500 | Same |
| GitHub Actions (annual refresh) | Posts to Slack directly via curl | |
| `mti_monthly_stats.sh` (jobnexus cron) | Posts Slack error on empty response / report-build error | |
| `mti_github_poll.sh` (jobnexus cron) | Posts Slack error on API rate limit / fetch fail | |
| `mti_uptime.sh` (jobnexus cron, every 5 min) | Posts "DOWN" to Slack after 2 consecutive non-200; posts recovery on return | |

Client-side failures (FlipCounter poll, Calculator tracking ping) `console.warn` only. They're UI-refresh noise, not real breakage, and they'd spam if wired to Slack.

## Cron jobs and scheduled tasks

All on `jobnexus-server`, sudo crontab:

| Schedule | Script | Purpose | Failure handling |
|----------|--------|---------|-----------------|
| `*/5 * * * *` | `/usr/local/bin/mti_uptime.sh` | External 200 check on `movetoisrael.fyi` | Slack alert on 2 consecutive fails + recovery |
| `*/15 * * * *` | `/usr/local/bin/mti_github_poll.sh` | New issues/PRs on `quietnotion/movetoisrael` → Slack | Slack alert on API failure |
| `0 6 2 * *` (Jerusalem 9am, 2nd of month) | `/usr/local/bin/mti_monthly_stats.sh` | Monthly stats from `/api/stats` with MoM + YoY deltas → Slack | Slack alert on empty response or report error |

Plus the GitHub Action `.github/workflows/annual-refresh-reminder.yml`:

| Schedule | Action | Failure handling |
|----------|--------|------------------|
| `0 9 10 1 *` (Jan 10, 9am UTC) | Open tax-year refresh issue, post to Slack | Workflow failure notifies repo watchers |
| `0 9 15 3 *` (Mar 15, 9am UTC) | Bump the refresh issue if still open, post to Slack | Same |

## Evergreen refresh process

The goal: keep the calculator accurate year over year without ongoing babysitting.

### The annual rollover

On January 10, GitHub Actions fires the `annual-refresh-reminder` workflow:

1. Creates an issue titled "Annual tax-year refresh for YYYY" with a pre-filled checklist
2. Posts to Slack `#movetoisrael` with the issue link

To roll the data, follow the checklist in `scripts/update-year.md`:

1. `cp src/data/years/2026.ts src/data/years/2027.ts`
2. Update every numeric block by visiting each source URL cited in the block
3. Split into **primary-source refreshes** (IRS, Israel Tax Authority, Bituach Leumi, Misrad Haklita, oleh benefits) and **inflation reviews** (Jewish day school tuition, college savings, KFF health premium, Tax Foundation property tax, arnona baseline)
4. Apply CPI adjustment to cost-of-living figures if no new annual survey has dropped yet
5. Update `lastReviewed` and `nextScheduledRefresh` in the new year file
6. Add the import to `src/data/current.ts` and flip `CURRENT_TAX_YEAR`
7. Push a PR; Vercel auto-deploys a preview for human QA before merge

On March 15, if the issue is still open, GitHub Actions bumps it with a second Slack alert.

### Live data

FX rate and the usage counter are fetched live at render time and don't require manual refresh. Sal Klita amounts are computed live from the stored NIS base rates × current FX.

## Deployment pipeline

### Flow

1. Push to `main` on `quietnotion/movetoisrael`
2. Vercel detects the push via GitHub integration
3. Vercel builds Next.js (Turbopack), runs TypeScript, generates static assets, creates build cache
4. Deployment goes live at `movetoisrael.fyi` (apex A record to `216.198.79.1`, Vercel's edge IP)
5. `www.movetoisrael.fyi` redirects to apex via a `next.config.ts` edge redirect rule

### Environment variables (Vercel project, all Production)

| Var | Source | Purpose |
|-----|--------|---------|
| `KV_REST_API_URL` | Upstash Redis integration | Counter read/write endpoint |
| `KV_REST_API_TOKEN` | Upstash Redis integration | Write-capable token |
| `KV_REST_API_READ_ONLY_TOKEN` | Upstash Redis integration | Unused currently |
| `KV_URL`, `REDIS_URL` | Upstash Redis integration | Protocol-level URLs, unused by us |
| `SLACK_ADMIN_TOKEN` | QN Admin CLI bot (`~/.slack_helpers.sh`) | Server-side error alerts |
| `SLACK_ALERT_CHANNEL` | `C0ATWQCKUDT` (`#movetoisrael`) | Alert target channel |
| `NEXT_PUBLIC_GA_ID` | `G-0J1RG51RJC` | GA4 Measurement ID (public-safe, exposed client-side) |

### DNS records (Porkbun)

| Type | Host | Value | Notes |
|------|------|-------|-------|
| A | (blank, apex) | `216.198.79.1` | Points apex to Vercel edge |
| A | www | `216.198.79.1` | Same target; app redirects to apex |
| TXT | (blank, apex) | `google-site-verification=nZevhql0M-1gxIQmgoAvGWZXGdNhbwtPqNc7Rrfv_oU` | Google Search Console |

### Costs audit

| Item | Annual | Notes |
|------|--------|-------|
| Porkbun .fyi renewal | $5.66 | Only real charge |
| Vercel Hobby | $0 | Hard-capped; cannot auto-bill on Hobby. If limits hit, traffic throttles; no card charge |
| Upstash Redis (via Vercel Marketplace) | $0 | Free tier: 256 MB, 500K cmds/mo. Realistic ceiling ~16K calcs/day |
| GitHub (public repo + Actions) | $0 | Public repo tier is generous |
| Google Analytics 4 | $0 | Free tier handles 10M events/mo |
| Slack | $0 | QN Admin CLI bot, existing workspace |
| jobnexus-server crons | $0 | Server already paid for |
| **Total** | **$5.66/yr** | |

## Runbook

### Something is broken. Where do I look?

1. **Check `#movetoisrael` Slack.** If it's broken, it has posted there (or the `mti_uptime.sh` has posted "DOWN").
2. **Site is down entirely** → check Vercel project dashboard for deploy failures. Check Porkbun DNS hasn't been tampered with (A record should still be `216.198.79.1`). Check `vercel inspect https://movetoisrael.fyi --logs`.
3. **Counter stuck at 0** → check Vercel env vars for `KV_REST_API_URL` + `KV_REST_API_TOKEN`. Check Upstash dashboard via `vercel integration list` → open the resource URL.
4. **FX rate stuck at 3.00** → Stooq fallback is firing. Check `https://stooq.com/q/l/?s=usdils&f=sd2t2ohlcv&h&e=csv` directly. Could be Stooq outage or CSV format change.
5. **GA4 not recording events** → check `NEXT_PUBLIC_GA_ID` in Vercel env, view-source on the homepage for the `gtag/js?id=...` script tag, then GA4 DebugView.
6. **GitHub Action didn't fire** → check Actions tab on the repo. `SLACK_ADMIN_TOKEN` secret must be set.
7. **Monthly Slack report didn't arrive** → `ssh jobnexus-server 'tail -n 50 /var/log/mti_monthly_stats.log'`.

### Common operational tasks

- **Rotate the Slack bot token**: update `SLACK_ADMIN_TOKEN` on Vercel (`vercel env rm && vercel env add`), update the inline token in the jobnexus cron scripts (`/usr/local/bin/mti_*.sh`), update the GitHub repo secret (`gh secret set SLACK_ADMIN_TOKEN`).
- **Change the alert channel**: flip `SLACK_ALERT_CHANNEL` env var on Vercel, update `CHANNEL` variable in each cron script, update the hard-coded channel ID in the GitHub Action YAML.
- **Force a FX refresh**: the cache is 1h; a redeploy busts it. Or wait.
- **Reset the counter** (do not do this without reason): `vercel env pull && npx tsx -e 'import { Redis } from "@upstash/redis"; const r = Redis.fromEnv(); await r.del("mti:calc:total");'`.
- **Check how many calculations ran in a month**: `curl https://movetoisrael.fyi/api/stats` and read the `monthly` object.

### Where things live

| Thing | Location |
|-------|----------|
| Source code | `~/code/movetoisrael` (GitHub: `quietnotion/movetoisrael`) |
| Vercel project | `quietnotions-projects/movetoisrael` (`prj_guh1JWJ6kwkkw4Kebx03H4yDoHBE`) |
| Upstash Redis | Vercel Marketplace, linked to the project, resource `upstash-kv-bole-book` |
| Cron scripts | `/usr/local/bin/mti_*.sh` on `jobnexus-server` |
| Cron state | `/var/lib/mti_*` on `jobnexus-server` |
| Cron logs | `/var/log/mti_*.log` on `jobnexus-server` |
| GA4 property | `movetoisrael.fyi` under Quiet Notion, Measurement ID `G-0J1RG51RJC` |
| Search Console property | `movetoisrael.fyi` (Domain verification via DNS TXT) |
| Bing Webmaster | `movetoisrael.fyi/` (imported from GSC) |

## SEO and discoverability

- `robots.txt` explicitly allows GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot
- `/llms.txt` describes the site and the API endpoint for AI agents
- `/sitemap.xml` auto-generated by `src/app/sitemap.ts`
- JSON-LD in `layout.tsx`: `WebApplication` + `FAQPage` for rich results
- OG card at `/opengraph-image` (1200×630, Next.js ImageResponse on the edge)
- `nofollow noopener` on every outbound citation link to conserve link credit
- Submitted to Google Search Console, Bing Webmaster, IndexNow (covers Bing / Yandex / Naver)

## Honest limitations

- **Client-side counter ping can be missed** by ad-blockers or slow bouncers (<5 seconds). This undercounts real visitors. GA4 is the more accurate visitor number; the on-page counter is for social proof.
- **Upstash free tier caps** at 500K cmds/mo. Each visitor adds 2 (page load + track ping). Realistic ceiling ≈250K monthly visitors before we'd need to upgrade or switch backends.
- **FX rate cached 1 hour** — not real-time. For a calculator this is fine; day-to-day moves rarely shift the big number meaningfully.
- **Arnona estimate** uses home value as a proxy for square meters, which isn't how municipalities actually charge. The per-row note tells the user this.
- **CPI inflation adjustments** in the annual rollover are manual; I have no automated scraper yet for IRS Rev Proc / KFF / Tax Foundation.
- **Nothing is translated to Hebrew.** Audience is American English speakers by design.
