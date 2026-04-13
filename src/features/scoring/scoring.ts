import {
  BUMPERS_MULTIPLIER,
  EXPERT_SCORE_WEIGHTS,
  FUN_SCORE_WEIGHTS,
  MAX_DURATION_BONUS,
  NOISE_FLOOR,
} from "@/lib/constants";
import type { ScoringMode } from "@/lib/constants";
import type { PlayerScore } from "@/types";

export interface TurnAccumulators {
  frameCount: number;
  totalRMS: number;
  activeFrames: number;
  pitchBuckets: Set<number>;
  pitchClasses: Set<number>;
  elapsed: number;
  hasBumpers: boolean;
}

export interface NoteAccumulators {
  weightedScore: number;
  totalWeight: number;
  perfects: number;
  goods: number;
  oks: number;
  misses: number;
  goldenHits: number;
  goldenTotal: number;
  bestStreak: number;
  notesScored: number;
}

export interface ScoreOptions {
  mode: ScoringMode;
  expectedPitchClasses?: Set<number>;
  noteAccumulators?: NoteAccumulators;
}

export function calculatePitchClassAccuracy(
  detectedClasses: Set<number>,
  expectedClasses: Set<number>
): number {
  if (expectedClasses.size === 0) return 0;
  let overlap = 0;
  for (const c of detectedClasses) {
    if (expectedClasses.has(c)) overlap++;
  }
  return Math.round((overlap / expectedClasses.size) * 100);
}

export function calculateScore(
  acc: TurnAccumulators,
  options: ScoreOptions = { mode: "fun" }
): PlayerScore {
  const { frameCount, totalRMS, activeFrames, pitchBuckets, pitchClasses, elapsed, hasBumpers } =
    acc;
  const { mode, expectedPitchClasses, noteAccumulators } = options;

  const avgRMS = frameCount > 0 ? totalRMS / frameCount : 0;
  let energyScore = Math.min(100, avgRMS * 500);

  const sustainPct = frameCount > 0 ? (activeFrames / frameCount) * 100 : 0;
  let sustainScore = Math.min(100, sustainPct);
  let durationScore = Math.min(
    100,
    (Math.min(elapsed, MAX_DURATION_BONUS) / MAX_DURATION_BONUS) * 100
  );

  if (hasBumpers) {
    energyScore = Math.min(100, energyScore * BUMPERS_MULTIPLIER);
    sustainScore = Math.min(100, sustainScore * BUMPERS_MULTIPLIER);
    durationScore = Math.min(100, durationScore * BUMPERS_MULTIPLIER);
  }

  // When per-note scoring data is available, use it as the primary score
  if (noteAccumulators && noteAccumulators.totalWeight > 0) {
    const noteScore =
      noteAccumulators.totalWeight > 0
        ? Math.min(
            100,
            Math.round(
              (noteAccumulators.weightedScore / noteAccumulators.totalWeight) * 100
            )
          )
        : 0;

    let pitchScore = noteScore;
    if (hasBumpers) {
      pitchScore = Math.min(100, pitchScore * BUMPERS_MULTIPLIER);
    }

    // Note-aware weights: note accuracy is the primary driver
    const noteWeights =
      mode === "expert"
        ? { noteAccuracy: 0.60, energy: 0.20, sustain: 0.10, duration: 0.10 }
        : { noteAccuracy: 0.35, energy: 0.35, sustain: 0.20, duration: 0.10 };

    const total = Math.round(
      pitchScore * noteWeights.noteAccuracy +
        energyScore * noteWeights.energy +
        sustainScore * noteWeights.sustain +
        durationScore * noteWeights.duration
    );

    const noteAccPct =
      noteAccumulators.notesScored > 0
        ? Math.round(
            ((noteAccumulators.perfects + noteAccumulators.goods + noteAccumulators.oks) /
              noteAccumulators.notesScored) *
              100
          )
        : 0;

    return {
      total: Math.min(100, Math.max(0, total)),
      energy: Math.round(energyScore),
      pitch: Math.round(pitchScore),
      sustain: Math.round(sustainScore),
      duration: Math.round(durationScore),
      time: elapsed,
      bumpers: hasBumpers,
      noteAccuracy: noteAccPct,
      bestStreak: noteAccumulators.bestStreak,
      goldenHits: noteAccumulators.goldenHits,
      goldenTotal: noteAccumulators.goldenTotal,
      perfects: noteAccumulators.perfects,
      goods: noteAccumulators.goods,
      oks: noteAccumulators.oks,
      noteMisses: noteAccumulators.misses,
    };
  }

  // Fallback: original scoring (freeform or songs without note data)
  const weights = mode === "expert" ? EXPERT_SCORE_WEIGHTS : FUN_SCORE_WEIGHTS;

  let pitchScore: number;
  if (mode === "expert" && expectedPitchClasses && expectedPitchClasses.size > 0) {
    pitchScore = calculatePitchClassAccuracy(pitchClasses, expectedPitchClasses);
  } else {
    pitchScore = Math.min(100, pitchBuckets.size * 5);
  }
  if (hasBumpers) {
    pitchScore = Math.min(100, pitchScore * BUMPERS_MULTIPLIER);
  }

  const total = Math.round(
    energyScore * weights.energy +
      pitchScore * weights.pitch +
      sustainScore * weights.sustain +
      durationScore * weights.duration
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
