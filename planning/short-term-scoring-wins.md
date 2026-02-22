# Short-Term Scoring Improvements — Easy Wins

These are concrete, targeted improvements to the scoring system. Each one is self-contained, doesn't require a major architecture change, and directly addresses the current problem: **the microphone picks up both the background music and the singer, and the scoring system can't tell them apart.**

---

## The Problem In Brief

All four scoring components are contaminated by background music:

| Score Component | How Background Music Inflates It |
|---|---|
| **Energy (40%)** | Music's RMS adds to the average constantly |
| **Sustain (20%)** | Music keeps signal above `NOISE_FLOOR` the whole time → `activeFrames/frameCount` ≈ 100% for everyone |
| **Pitch (30%)** | `pitchBuckets` fills with instrument pitches even when singer is silent — a 30s backing track easily hits 20+ semitones on its own |
| **Duration (10%)** | Fine — just measures time |

`NOISE_FLOOR = 0.02` is far too low to gate out music. `smoothingTimeConstant = 0.8` (heavy temporal averaging on the analyser) makes it slow to distinguish voice transients from sustained musical tones.

---

## Fix 4: Replace Autocorrelation with `pitchy` — Low Effort

**Library:** [`pitchy`](https://github.com/ianprime0509/pitchy) (tiny, pure TypeScript)

The current pitch detection in `src/features/scoring/scoring.ts:57–92` is a hand-rolled autocorrelation with known weaknesses:
- Octave errors (misidentifies pitch an octave too high/low)
- O(n²) time complexity
- Struggles with harmonically-rich signals (voice + music together)

`pitchy` uses the McLeod Pitch Method (MPM), which is more robust to harmonics and better at isolating the fundamental frequency even in noisy environments. It's a drop-in replacement.

```typescript
import { PitchDetector } from 'pitchy';

// Replace detectPitch() call with:
const detector = PitchDetector.forFloat32Array(bufferSize);
const [pitch, clarity] = detector.findPitch(floatBuffer, sampleRate);
if (clarity > 0.9) { /* pitch is reliable */ }
```

The `clarity` value (0–1) is a confidence score — this alone lets you discard low-confidence readings that the current implementation would treat as valid.

**Effort:** ~2 hours. Small npm package, pure TS, no native code.

---

## Fix 5: Spotify "Currently Playing" — Medium Effort, Nice UX Win

**API:** Spotify Web API (`GET /me/player/currently-playing`) — no Premium required

While not a direct scoring fix, this enables:
- Show the song name/artist in the app during the singer's turn
- Use `tempo` (BPM) from Audio Features as a difficulty multiplier — faster songs score harder/give a bonus
- Pull listening history to suggest songs other players might know
- Eventually: seed song difficulty ratings

`@tanstack/react-query` is already installed and unused — it's the right tool for these API calls. The OAuth flow would need to be added.

**Limitations:**
- Spotify's public API has **no lyrics endpoint** — lyrics in the Spotify phone app are licensed for their use only. If lyrics in the web app ever become needed, LRCLIB (free, no API key) or Musixmatch (free tier) are the realistic options.
- The currently-playing endpoint polls; it's not a real-time stream.

**Effort:** ~1–2 days including OAuth setup and UI integration.

---

## Recommended Order

1. **`pitchy`** — small effort, noticeable pitch quality improvement
2. **Spotify Currently Playing** — good UX addition once core scoring is solid
