# Hive Grimoire

A bee-themed Goetic timing & sigil companion. 72 spirits of the *Ars Goetia* mapped to a honeycomb grid, with accurate planetary hours and deterministic intent matching.

## Features

- **Honeycomb Grid** — 72 hexagonal cells, one per Goetic spirit. Current planetary hour's matching spirits glow amber. Search by keyword to find spirits by domain.
- **Spirit Detail** — Sigil display, correspondences (planet, zodiac, metal, direction), powers, and a timing panel showing the next optimal working window.
- **Planetary Hours Clock** — Real-time Chaldean planetary hours calculated from true sunrise/sunset via device geolocation.
- **Intent Matcher** — Enter a goal in natural language; deterministic keyword matching returns ranked candidate spirits with timing.
- **Working Journal** — Log sessions with spirit, intent, planetary hour, and notes. Stored in IndexedDB (never leaves your device). Export to Markdown for Obsidian.
- **Meditation Mode** — Full-screen sigil with breath-pacing ring and configurable timer.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Run tests

```bash
npm test
```

### Docker self-hosting

```bash
docker compose up --build
```

Serves on port 3000.

### Deploy to Vercel

Push to GitHub and import in the Vercel dashboard. No configuration needed — Next.js is auto-detected.

## Tech Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS** with amber/gold/black palette
- **suncalc** for astronomical calculations
- **idb** for IndexedDB journal storage
- Static JSON data, no backend

## Data Sources

Spirit data is compiled from public domain sources:

- Joseph Peterson's critical edition (esotericarchives.com)
- S.L. MacGregor Mathers, *The Goetia* (1904)
- British Library Sloane MSS 2731 and 3825

Each spirit entry notes its manuscript provenance. Sigils are currently geometric placeholders pending reproduction from manuscript sources.

## Planetary Hours Accuracy

Planetary hours follow the Chaldean order (Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon). Day hours divide the period from true sunrise to sunset into 12 equal parts; night hours divide sunset to next sunrise into 12 equal parts. The first hour of each day is ruled by the day's planet (Sun on Sunday, Moon on Monday, etc.).

The calculation uses the `suncalc` library for solar position and is verified against known planetary hour tables.

## Philosophical Framing

This app treats the Goetia as a symbolic map of consciousness — archetypal forces to be understood and integrated, not literal entities to command. The bee symbolism reflects this: a hive is a distributed intelligence, each cell a discrete pattern, the whole greater than the sum. The 72 sigils are cells in that hive of human psychic experience.

**This is a contemplative and study tool, not a claim about metaphysical efficacy.**

## License

MIT
