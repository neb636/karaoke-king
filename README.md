# 🎤 Karaoke King

**The ultimate fun-first tournament-style karaoke battle game.**

🔗 **[Play Now → neb636.github.io/karaoke-king](https://neb636.github.io/karaoke-king/)**

---

## What Is It?

Karaoke King is a browser-based party game for 2–8 players. Each player sings into their microphone and gets scored in real time on energy, pitch accuracy, sustain, and duration. Compete across multiple rounds to crown the ultimate Karaoke King.

No song files needed — just a microphone and a willingness to embarrass yourself.

---

## Features

- **Microphone-based scoring** — Uses the Web Audio API to analyze your voice in real time
- **Live audio visualizer** — Frequency bars react to your singing as you go
- **Energy bar & feedback toasts** — On-screen encouragement (or shame) while you sing
- **4 game modes:**
  - ⚡ **Quick Match** — One round, pure glory
  - 🏆 **Tournament** — Best of 3 rounds
  - 🔥 **Championship** — 5 rounds, prove your dominance
  - 👑 **Marathon** — 10-round ultimate showdown
- **Up to 8 players** with per-player neon color theming
- **Score breakdown** — Energy, pitch hits, sustain, and duration tracked separately
- **Cumulative standings** — Leaderboard updates after each round in multi-round modes
- **Confetti & champion crowning** on final results
- **Bumper bonus** — Score multiplier for eligible players

---

## How to Play

1. Open the app and hit **Start Game**
2. Enter player names (2–8 players)
3. Choose a game mode
4. Each player takes a turn — hit **Start Singing**, wait for the countdown, then sing!
5. Hit **Stop** when done — your score is calculated instantly
6. After all players sing, see the round results
7. In multi-round modes, continue until the final round crowns the champion

---

## Scoring

Scores are calculated from four components:

| Component | Weight | What it measures |
|-----------|--------|-----------------|
| Energy    | 40%    | Overall vocal volume/intensity |
| Pitch     | 30%    | Number of pitch hits detected |
| Sustain   | 20%    | Consistency of sustained tone |
| Duration  | 10%    | How long you sang (up to 60s cap) |

---

## Tech Stack

- **React 19** + **Vite** + **TypeScript** (strict mode)
- **Tailwind CSS v3** + **shadcn/ui**
- **Zustand v5** — game state management
- **Web Audio API** — microphone input, frequency analysis, pitch detection
- **React Router v7**
- Deployed via **GitHub Pages** (GitHub Actions)

---

## Local Development

```bash
npm install
npm run dev
```

Requires a browser with microphone access (Chrome recommended).

```bash
npm run build   # production build
npm run preview # preview the build locally
```

---

## Browser Requirements

- Microphone permission required
- Modern browser with Web Audio API support (Chrome, Edge, Firefox, Safari 14.1+)
- HTTPS or localhost required for microphone access
