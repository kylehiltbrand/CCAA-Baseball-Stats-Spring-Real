[README.md](https://github.com/user-attachments/files/26524098/README.md)
# CCAA Baseball Stats — Spring 2026

A fully static, self-contained baseball statistics website covering the **Central Coast Athletic Association (CCAA)** — 15 high school teams across three divisions. Built for fast loading, zero dependencies, and easy deployment via GitHub + Vercel.

🔗 **Live site:** [ccaa-baseball-stats-spring-real.vercel.app](https://ccaa-baseball-stats-spring-real.vercel.app)

---

## Features

- **Standings** — Division-by-division win/loss records, updated manually each week
- **Team Pages** — Roster breakdowns and team-level stats for all 15 CCAA programs
- **Player Stats** — Sortable hitting and pitching leaderboards across the full league
- **Advanced Metrics** — Recalibrated to actual CCAA league context with small-sample regression logic:
  - *Hitting:* wOBA, wRC+, BB/K, oWAR
  - *Pitching:* ERA+, K/9, K/BB, pWAR
- **ESPN-style design** — Dark navy/gold color palette, clean typography, fully responsive

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Vanilla HTML, CSS, JavaScript |
| Data | `data.js` — all stats stored as a single JS module |
| Hosting | Vercel (auto-deploys from `main` branch) |
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
└── data.js           # All league data (rosters, stats, standings)
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

---

## About the CCAA

The Central Coast Athletic Association is a high school athletic conference serving schools along California's Central Coast. The baseball league spans three competitive divisions with 15 programs competing each spring.

---

*Built by [Kyle Hiltbrand](https://github.com/kylehiltbrand)*
