# movetoisrael.fyi

A free, open-source calculator that tells American families, in straight dollars, what moving to Israel would do to their income.

**Live:** [movetoisrael.fyi](https://movetoisrael.fyi)

## What it does

Pick a U.S. state, plug in household income and number of kids, and the calculator returns an annual take-home delta. Under the hood it compares:

- Federal + state income tax vs. Israeli income tax with the 10-year oleh benefit phased in
- FICA vs. Bituach Leumi
- Private Jewish day school tuition vs. free public Jewish education
- Property tax vs. arnona
- Employer-sponsored health insurance premiums vs. universal Kupat Holim coverage
- Child-allowance credits (Kitzvat Yeladim) in Israel
- Sal Klita arrival cash from Misrad Haklita

All sources are linked in the page itself. If you think a number is wrong, open an issue — that's the point of it being open source.

## Stack

Next.js 16 App Router, React 19, TypeScript, Tailwind v4. Hosted on Vercel. Upstash Redis backs the public usage counter. Stooq supplies the USD/ILS rate with a fallback.

Full architecture, data model, alert pipeline, and annual-refresh process are documented in [PROJECT.md](PROJECT.md).

## Run it locally

```bash
git clone https://github.com/quietnotion/movetoisrael
cd movetoisrael
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The counter and Slack-alerting features require `KV_REST_API_*` and `SLACK_ADMIN_TOKEN` env vars, but the calculator runs fine without them.

## Evergreen by design

The calculator is built to be easy to update each tax year. All year-specific numbers live in a single frozen snapshot at `src/data/years/YYYY.ts`. A GitHub Action opens a refresh issue every January 10th so the numbers don't go stale. See [PROJECT.md](PROJECT.md#annual-refresh) for the full process.

## Contributing

PRs welcome. Especially helpful:

- Corrections to tax data or sourcing (cite the official source in the PR)
- Accuracy improvements on the Israeli side (oleh benefit edge cases, city-tier arnona)
- Accessibility fixes
- Translations of the intangibles copy

Please open an issue first for anything larger than a typo fix.

## Copying the calculator

You're encouraged to copy this calculator and embed it in your own sites or applications. Tax numbers, oleh benefit thresholds, and Sal Klita amounts get refreshed every year — please plan to pull a new version at least annually so your visitors aren't seeing stale data. See [PROJECT.md](PROJECT.md#annual-refresh) for the refresh cadence.

## License

[MIT](LICENSE). Built by [Quiet Notion](https://quietnotion.com).
