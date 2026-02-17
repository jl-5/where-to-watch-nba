# Where to Watch NBA Games

A Next.js app to browse the 2025-26 nationally televised NBA schedule.

## Features

- Today\'s game highlight section
- Team logos in matchup rows
- Filters for team, network, and timezone
- Toggle to hide/show previous dates
- Light and dark mode

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Data source

The app reads:

- `public/nba_2025_26_national_tv_schedule.csv`

To regenerate the CSV from the source PDF, run from the repository root:

```bash
python3 pdf_scraper.py
```

## Lint and production build

```bash
npm run lint
npm run build
```

## Deploy

Recommended host: Vercel.

- Import the repo in Vercel
- Set root directory to `where-to-watch-nba`
- Deploy
