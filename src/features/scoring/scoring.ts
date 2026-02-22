import {
  BUMPERS_MULTIPLIER,
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
