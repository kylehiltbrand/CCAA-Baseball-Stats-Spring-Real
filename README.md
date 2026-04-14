# CCAA Baseball Stats — Spring 2026

A fully static, self-contained baseball statistics website covering the **Central Coast Athletic Association (CCAA)** — 15 high school teams across three divisions on California's Central Coast. Built for fast loading, zero dependencies, and easy deployment via GitHub + Vercel.

🔗 **Live site:** [ccaabaseballstats.com](https://ccaabaseballstats.com)

---

## Features

- **Standings** — Division-by-division win/loss records, updated manually each week
- **Team Pages** — All 15 CCAA programs with team badges and logos
- **Player Stats** — Sortable hitting and pitching leaderboards with search and team filter
- **Player Profiles** — Click any player to see their full stat card in a modal
- **Advanced Metrics** — Recalibrated to actual CCAA league context with small-sample regression logic:
  - *Hitting:* wOBA, wRC+, BB/K, oWAR
  - *Pitching:* ERA+, K/9, K/BB, pWAR
- **School Logos** — All 15 programs represented with transparent-background PNG logos
- **ESPN-style design** — Dark navy/gold color palette, clean typography, fully responsive (desktop + mobile)

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Vanilla HTML, CSS, JavaScript |
| Data | `data.js` — all stats stored as a single JS module |
| Hosting | Vercel (auto-deploys from `main` branch) |
| Domain | ccaabaseballstats.com |
| Repo | GitHub |

No frameworks, no build step, no external dependencies. Everything runs in the browser from a single static file load.

---

## Project Structure

```
CCAA-Baseball-Stats-Spring-Real/
├── index.html        # Home / landing page
├── standings.html    # Division standings
├── stats.html        # Player stats leaderboard (hitting + pitching)
├── teams.html        # Team-by-team breakdown
├── data.js           # All league data (rosters, stats, standings)
├── favicon.svg       # Site favicon
└── *.png             # School logos (ag.png, ata.png, sj.png, etc.)
```

---

## Updating Stats

All data lives in `data.js`. To update the site:

1. Edit player/team stats in `data.js`
2. Commit and push to `main`
3. Vercel auto-deploys within ~30 seconds

---

## Advanced Metrics Methodology

Standard baseball metrics (wOBA, WAR, ERA+, etc.) are scaled to MLB baselines by convention. This site recalibrates those baselines to **actual CCAA league averages**, making comparisons meaningful at the high school level. Small-sample corrections are applied to avoid outlier inflation early in the season.

League constants used: lg AVG .305 · lg wOBA .358 · lg ERA 4.83 · lg K/9 7.5

---

## About the CCAA

The Central Coast Athletic Association is a high school athletic conference serving schools along California's Central Coast. The baseball league spans three competitive divisions — Mountain, Sunset, and Ocean — with 15 programs competing each spring.

---

*Built by [Kyle Hiltbrand](https://kylehiltbrand.com)*
