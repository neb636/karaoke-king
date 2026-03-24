import {
  BUMPERS_MULTIPLIER,
  CURATED_SCORE_WEIGHTS,
  MAX_DURATION_BONUS,
  NOISE_FLOOR,
  SCORE_WEIGHTS,
} from "@/lib/constants";
import type { PlayerScore } from "@/types";

export interface TurnAccumulators {
  frameCount: number;
  totalRMS: number;
  activeFrames: number;
  pitchBuckets: Set<number>;
  elapsed: number;
  hasBumpers: boolean;
}

export interface CuratedTurnAccumulators extends TurnAccumulators {
  /** Number of frames where the detected pitch was within ±1 semitone of the reference */
  pitchHits: number;
  /** Total number of frames that had an active reference note to match against */
  referencedFrames: number;
}

export function calculateScore(acc: TurnAccumulators): PlayerScore {
  const { frameCount, totalRMS, activeFrames, pitchBuckets, elapsed, hasBumpers } = acc;

  const avgRMS = frameCount > 0 ? totalRMS / frameCount : 0;

  let energyScore = Math.min(100, avgRMS * 500);
  let pitchScore = Math.min(100, pitchBuckets.size * 5);
  const sustainPct = frameCount > 0 ? (activeFrames / frameCount) * 100 : 0;
  let sustainScore = Math.min(100, sustainPct);
  let durationScore = Math.min(
    100,
    (Math.min(elapsed, MAX_DURATION_BONUS) / MAX_DURATION_BONUS) * 100,
  );

  if (hasBumpers) {
    energyScore = Math.min(100, energyScore * BUMPERS_MULTIPLIER);
    pitchScore = Math.min(100, pitchScore * BUMPERS_MULTIPLIER);
    sustainScore = Math.min(100, sustainScore * BUMPERS_MULTIPLIER);
    durationScore = Math.min(100, durationScore * BUMPERS_MULTIPLIER);
  }

  const total = Math.round(
    energyScore * SCORE_WEIGHTS.energy +
      pitchScore * SCORE_WEIGHTS.pitch +
      sustainScore * SCORE_WEIGHTS.sustain +
      durationScore * SCORE_WEIGHTS.duration,
  );

  return {
    total: Math.min(100, Math.max(0, total)),
    energy: Math.round(energyScore),
    pitch: Math.round(pitchScore),
    sustain: Math.round(sustainScore),
    duration: Math.round(durationScore),
    time: elapsed,
    bumpers: hasBumpers,
  };
}

/**
 * Curated-mode scoring. Uses reference pitch accuracy instead of pitch variety.
 *
 * Weight breakdown (vs. freeform):
 *   Energy   30% (down from 40%) — raw volume is less important when music is playing
 *   Pitch    35% (up from 30%)   — accuracy vs. reference melody
 *   Sustain  20%                 — unchanged
 *   Duration 15% (up from 10%)   — the song has a structure; singing through it matters
 */
export function calculateCuratedScore(acc: CuratedTurnAccumulators): PlayerScore {
  const {
    frameCount, totalRMS, activeFrames, pitchBuckets, elapsed, hasBumpers,
    pitchHits, referencedFrames,
  } = acc;

  const avgRMS = frameCount > 0 ? totalRMS / frameCount : 0;

  let energyScore = Math.min(100, avgRMS * 500);

  // Pitch score: blend reference accuracy (when available) with variety fallback
  let pitchScore: number;
  if (referencedFrames > 30) {
    // Enough reference data: use accuracy as primary signal (0–100)
    const accuracyPct = (pitchHits / referencedFrames) * 100;
    // Blend with variety score so singers who riff still get some credit
    const varietyPct = Math.min(100, pitchBuckets.size * 5);
    pitchScore = Math.min(100, accuracyPct * 0.7 + varietyPct * 0.3);
  } else {
    // Not enough reference frames (song has no pitch data yet) — fall back
    pitchScore = Math.min(100, pitchBuckets.size * 5);
  }

  const sustainPct = frameCount > 0 ? (activeFrames / frameCount) * 100 : 0;
  let sustainScore = Math.min(100, sustainPct);
  let durationScore = Math.min(
    100,
    (Math.min(elapsed, MAX_DURATION_BONUS) / MAX_DURATION_BONUS) * 100,
  );

  if (hasBumpers) {
    energyScore = Math.min(100, energyScore * BUMPERS_MULTIPLIER);
    pitchScore = Math.min(100, pitchScore * BUMPERS_MULTIPLIER);
    sustainScore = Math.min(100, sustainScore * BUMPERS_MULTIPLIER);
    durationScore = Math.min(100, durationScore * BUMPERS_MULTIPLIER);
  }

  const total = Math.round(
    energyScore * CURATED_SCORE_WEIGHTS.energy +
      pitchScore * CURATED_SCORE_WEIGHTS.pitch +
      sustainScore * CURATED_SCORE_WEIGHTS.sustain +
      durationScore * CURATED_SCORE_WEIGHTS.duration,
  );

  return {
    total: Math.min(100, Math.max(0, total)),
    energy: Math.round(energyScore),
    pitch: Math.round(pitchScore),
    sustain: Math.round(sustainScore),
    duration: Math.round(durationScore),
    time: elapsed,
    bumpers: hasBumpers,
  };
}

export function detectPitch(buf: Uint8Array, sampleRate: number): number {
  const SIZE = buf.length;
  const signal = new Float32Array(SIZE);
  let maxVal = 0;

  for (let i = 0; i < SIZE; i++) {
    signal[i] = (buf[i]! - 128) / 128;
    if (Math.abs(signal[i]!) > maxVal) maxVal = Math.abs(signal[i]!);
  }

  if (maxVal < NOISE_FLOOR) return -1;

  const corr = new Float32Array(SIZE);
  for (let lag = 0; lag < SIZE; lag++) {
    let sum = 0;
    for (let i = 0; i < SIZE - lag; i++) {
      sum += signal[i]! * signal[i + lag]!;
    }
    corr[lag] = sum;
  }

  let d = 0;
  while (d < SIZE / 2 && corr[d]! > corr[d + 1]!) d++;

  let maxCorr = -1;
  let maxIdx = d;
  for (let i = d; i < SIZE / 2; i++) {
    if (corr[i]! > maxCorr) {
      maxCorr = corr[i]!;
      maxIdx = i;
    }
  }

  if (maxCorr < 0.01) return -1;
  return sampleRate / maxIdx;
}
