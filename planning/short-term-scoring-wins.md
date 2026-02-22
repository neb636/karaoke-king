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

## Fix 1: Reduce `smoothingTimeConstant` — Trivial

**File:** `src/features/audio/useAudio.ts:117`
**Change:** `analyser.smoothingTimeConstant = 0.8` → `0.4` or `0.5`

The analyser currently blends 80% of the previous frame with 20% of the current one. This smooths out the rapid spectral changes that distinguish voice from sustained instrumental tones. Lowering to 0.4–0.5 makes pitch detection snappier and more responsive to actual singing.

**Effort:** 1 line. Zero new dependencies.

---

## Fix 2: Band-Pass Filter for Voice Frequencies — Low Effort

**File:** `src/features/audio/useAudio.ts` (`initAudio` function)

Human voice fundamentals live at ~80Hz–3kHz. Background music concentrates energy in bass (kick/bass guitar: 40–250Hz) and treble (cymbals/hi-hats: 8–20kHz). Adding two `BiquadFilterNode`s cuts the frequency ranges where music dominates.

```typescript
// In initAudio(), replace:
source.connect(analyser);

// With:
const highpass = audioCtx.createBiquadFilter();
highpass.type = 'highpass';
highpass.frequency.value = 100; // cuts bass/kick drum energy

const lowpass = audioCtx.createBiquadFilter();
lowpass.type = 'lowpass';
lowpass.frequency.value = 3500; // cuts cymbals/hi-hats

source.connect(highpass);
highpass.connect(lowpass);
lowpass.connect(analyser);
```

This reduces bass-heavy music from inflating energy scores and cuts a chunk of the instrument pitches from polluting `pitchBuckets`.

**Effort:** ~10 lines. Zero new dependencies — pure Web Audio API.

---

## Fix 3: Voice Activity Detection (VAD) — Medium Effort, Highest Impact

**Library:** [`@ricky0123/vad-web`](https://github.com/ricky0123/vad)

This runs the Silero VAD model entirely in the browser via ONNX Runtime. It fires `onSpeechStart` and `onSpeechEnd` events in real time, detecting when a human voice is actually present.

**Why this directly solves the problem:** Gate all score accumulation behind voice detection. Only count frames where the singer is actually vocalizing.

```typescript
// Currently in tick() — all frames are counted:
frameCount.current++;
totalRMS.current += rms;
if (rms > NOISE_FLOOR) activeFrames.current++;
pitchBuckets.current.add(bucket);

// With VAD — only count during detected voice:
if (voiceActive) {
  frameCount.current++;
  totalRMS.current += rms;
  if (rms > NOISE_FLOOR) activeFrames.current++;
  pitchBuckets.current.add(bucket);
}
```

`voiceActive` is a ref toggled by the VAD's `onSpeechStart`/`onSpeechEnd` callbacks, which run alongside the existing `requestAnimationFrame` loop.

Most karaoke backing tracks are instrumental, so VAD cleanly separates singer from music. If a backing track has guide vocals, there may still be some bleed-through, but it's a significant improvement over the current state.

**Effort:** ~1 day. New dependency, requires ONNX runtime (VAD-web handles this). The trickiest part is initializing the VAD model asynchronously alongside `initAudio()`.

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

1. **`smoothingTimeConstant` reduction** — do it right now, 1 line
2. **Band-pass filter** — quick follow-up, no dependencies
3. **`pitchy`** — small effort, noticeable pitch quality improvement
4. **VAD** — the real fix for background music separation, worth doing properly
5. **Spotify Currently Playing** — good UX addition once core scoring is solid
