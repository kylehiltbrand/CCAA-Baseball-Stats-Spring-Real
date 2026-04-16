# CCAA Baseball Stats: Spring 2026

A fully static, self-contained baseball statistics website covering the **Central Coast Athletic Association (CCAA)**: 15 high school programs across three leagues on California's Central Coast. Built for fast loading, zero dependencies, and easy deployment via GitHub + Vercel.

🔗 **Live site:** [ccaabaseballstats.com](https://ccaabaseballstats.com)

---

## Features

### Standings & Rankings
- **League standings** for Mountain, Sunset, and Ocean Leagues with W/L/T records, win %, games behind, and recent streak
- **CCAA-wide RPI rankings** that normalize across leagues using a custom **60/25/15 weighting** (60% WP, 25% OWP, 15% OOWP) calibrated to a conference where leagues barely cross over
- Half-tie convention applied (ties count as 0.5 W + 0.5 L, NCAA standard)
- Inline overall record column for visual context alongside RPI scores
- Color-coded RPI tiers and a horizontal bar visual for at-a-glance comparison

### Stats & Leaderboards
- Sortable hitting and pitching leaderboards with team filter, league filter, search, and minimum PA/IP qualifiers
- Standard and Advanced views for both hitters and pitchers
- Two-Way leaderboard ranking players who hit and pitch by Total WAR (oWAR + pWAR)
- Click any row to open a detailed player profile modal with rankings vs. CCAA-wide and league-only fields
- CSV export of any current view (with all advanced stats included)

### Advanced Metrics
All metrics auto-calibrated to current CCAA league averages on every page load (no stale baselines):

**Hitting**
- wOBA (Weighted On-Base Average)
- wRC+ (Weighted Runs Created Plus, league-adjusted)
- oWAR (Offensive Wins Above Replacement)
- Proj40 oWAR (40-game pace projection)
- BB/K (Walk-to-Strikeout Ratio)
- BABIP (Batting Average on Balls in Play)

**Pitching**
- ERA+ (League-adjusted ERA)
- pWAR (Pitching Wins Above Replacement)
- Proj40 pWAR (40-game pace projection)
- K/9, K/BB, K%
- WHIP (Walks + Hits per Inning Pitched)

Every advanced stat in the glossary includes a "Why it matters" explainer to make the numbers accessible to readers who haven't worked with sabermetrics before.

### Design
- ESPN-style dark navy and gold color palette
- Clean Inter + Rajdhani typography
- Fully responsive (desktop + mobile, with bottom nav bar on small screens)
- All 15 programs represented with transparent-background PNG logos

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Vanilla HTML, CSS, JavaScript (no frameworks, no build step) |
| Data | `data.js`, a single JS module containing all stats, teams, and standings |
| Hosting | Vercel (auto-deploys from `main` branch within ~30 seconds) |
| Automation | GitHub Actions for stat scraping workflow |
| Domain | ccaabaseballstats.com |
| Repo | GitHub |

Everything runs in the browser from a single static file load. No server, no API, no database.

---

## Project Structure

```
CCAA-Baseball-Stats-Spring-Real/
├── index.html        # Home / landing page
├── standings.html    # League standings + CCAA-wide RPI rankings
├── stats.html        # Player stats leaderboard (hitting + pitching + two-way)
├── teams.html        # Team-by-team breakdown
├── about.html        # Site overview and advanced stats explainer
├── data.js           # All league data (rosters, stats, standings, RPI)
├── favicon.svg       # Site favicon
└── *.png             # School logos (ag.png, ata.png, sj.png, etc.)
```

---

## Updating Stats

All data lives in `data.js`. The typical weekly workflow:

1. Pull updated MaxPreps PDFs for any team that played
2. Update the relevant team blocks in `data.js`:
   - Team record, league record, GP, team-level batting/pitching aggregates
   - Player rows in the `batters[]` and `pitchers[]` arrays
3. Update `standingsData` records for any teams whose W/L changed
4. Update the `rpiData` block in `standings.html` if records changed
5. Bump `DATA_UPDATED` to today's date
6. Commit and push to `main`. Vercel auto-deploys

The site does the rest. League averages, color thresholds, wRC+ values, ERA+ values, oWAR, pWAR, and Projected WARs all recalculate automatically from the new raw stats.

---

## Advanced Metrics Methodology

Standard baseball metrics (wOBA, WAR, ERA+, etc.) are scaled to MLB baselines by convention. This site recalibrates those baselines to **actual CCAA league averages**, making comparisons meaningful at the high school level.

### Auto-recalibration

On every page load, `data.js` runs a `recalcLeagueAvgs()` function that:

1. Sums every batter's PA/AB/H/BB/HBP/2B/3B/HR/SF/K to compute true league wOBA, AVG, OBP, BABIP, and runs per PA
2. Sums every pitcher's IP/ER/BB/K/H to compute true league ERA, K/9, BB/9, and WHIP
3. Reassigns the league constants used by wRC+ and ERA+ formulas
4. Re-runs `calcWRC_plus`, `calcOWAR`, `calcERA_plus`, `calcPWAR` on every player object so all displayed advanced stats reflect the freshly-calibrated baseline
5. Updates dynamic color thresholds for BABIP and WHIP (±15% from league average) so coloring scales with current play

This means league constants never drift. Push a stat update, and the calibration self-tunes.

### Small-sample regression

Advanced stats are regressed toward league average for small samples to avoid early-season outlier inflation:

- wRC+ regressed toward 100 below 80 PA (toward replacement level 65 for sub-average hitters)
- ERA+ regressed toward 100 below 40 IP
- oWAR/pWAR regressed proportionally below their PA/IP credibility thresholds

### RPI weighting rationale

Standard NCAA RPI uses 25% WP / 50% OWP / 25% OOWP. This site uses **60% WP / 25% OWP / 15% OOWP** because the CCAA's three leagues play almost entirely separate schedules, which makes pure schedule-strength comparisons less reliable. The weighting keeps schedule strength meaningful at the top of the rankings while preventing winning teams from being unfairly punished by their league's out-of-conference performance. Ties count as half a win and half a loss (NCAA convention).

---

## About the CCAA

The Central Coast Athletic Association is a high school athletic conference serving schools along California's Central Coast. The baseball league spans three competitive leagues:

- **Mountain League:** St. Joseph, Arroyo Grande, Righetti, Mission Prep, Lompoc, Morro Bay
- **Sunset League:** San Luis Obispo, Paso Robles, Atascadero, Templeton, Cabrillo
- **Ocean League:** Nipomo, Pioneer Valley, Santa Ynez, Santa Maria

15 programs total, competing each spring.

---

*Built by [Kyle Hiltbrand](https://kylehiltbrand.com)*
