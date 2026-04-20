# Security Policy

## Reporting a vulnerability

If you find a security issue, please email **ross@quietnotion.com** rather than opening a public issue. Include a description, reproduction steps, and any proposed fix.

You'll get a response within 72 hours. Verified vulnerabilities are typically patched and deployed within a week.

## Scope

This repo powers [movetoisrael.fyi](https://movetoisrael.fyi), a static-ish Next.js site on Vercel with a single Redis-backed counter and no user accounts. The realistic attack surface is:

- Input validation on `/api/calculate` and `/api/stats`
- Supply-chain issues in dependencies (covered by Dependabot)
- Leaked credentials in git history (none currently; do not add any)

Reports outside that scope (e.g. "Next.js has a CVE") are welcome but usually already tracked upstream.
