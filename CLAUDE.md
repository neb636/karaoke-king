# Karaoke King

Browser-based party karaoke scoring game. React 19 + TypeScript + Vite, deployed to GitHub Pages.

## Tech Stack
- React 19, TypeScript (strict), Vite
- Tailwind CSS v3 + shadcn/ui
- Zustand v5 — game state
- Web Audio API — microphone input and scoring
- React Router v7
- GitHub Actions → GitHub Pages deployment

## Key Directories
- `src/features/` — feature modules (game flow, scoring, audio, etc.)
- `src/data/songs/` — song catalog (`catalog.json`, `category-songs.json`)
- `src/store/` — Zustand stores
- `src/types/` — shared TypeScript types
- `public/song-data/` — per-song UltraStar data (JSON, one file per song)
- `scripts/` — tooling (merge-extraction.mjs)
- `planning/` — app vision and long-term ideas docs

## Development
```bash
npm install
npm run dev       # dev server
npm run build     # production build
npm run preview   # preview build locally
```

## Adding Songs
Songs come from the `../music-metadata-extractor` companion tool. After running extraction:
```bash
npm run merge-songs -- /path/to/music-metadata-extractor/results/timestamp-dir
```
This merges catalog entries, category assignments, and song-data JSON files. Review with `git diff` before committing.

## Core Philosophy
Fun-first scoring: rewards effort and energy over technical precision. See `planning/app-vision.md`.
