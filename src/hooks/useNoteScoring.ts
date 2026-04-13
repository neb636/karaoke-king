import { useRef, useMemo, useCallback, useState } from "react";
import type { DataFormat, Note, NoteType } from "@/types/songs";
import type { ScoringMode } from "@/lib/constants";
import { NOISE_FLOOR } from "@/lib/constants";
import { beatToMs } from "@/data/songs/songData";

// ── Note grade types ─────────────────────────────────────────────────────────

export type NoteGrade = "perfect" | "good" | "ok" | "miss";

export interface StreakTier {
  label: string;
  multiplier: number;
  minStreak: number;
}

export const STREAK_TIERS: StreakTier[] = [
  { label: "LEGENDARY", multiplier: 1.5, minStreak: 30 },
  { label: "UNSTOPPABLE", multiplier: 1.3, minStreak: 20 },
  { label: "ON FIRE", multiplier: 1.2, minStreak: 10 },
  { label: "WARMING UP", multiplier: 1.1, minStreak: 5 },
];

export function getStreakTier(streak: number): StreakTier | null {
  for (const tier of STREAK_TIERS) {
    if (streak >= tier.minStreak) return tier;
  }
  return null;
}

// ── Pre-computed note window for fast lookup ─────────────────────────────────

interface NoteWindow {
  note: Note;
  startMs: number;
  endMs: number;
  /** Weight: golden = 2, normal = 1, rap/freestyle = 0.5 */
  weight: number;
}

function buildNoteWindows(data: DataFormat): NoteWindow[] {
  const { bpm, gapMs, tracks, isDuet } = data;
  const track = isDuet ? tracks.find((t) => t.player === "P1") : tracks[0];
  if (!track) return [];

  const windows: NoteWindow[] = [];
  for (const line of track.lines) {
    for (const note of line.notes) {
      const startMs = beatToMs(note.beat, bpm, gapMs);
      const endMs = beatToMs(note.beat + note.duration, bpm, gapMs);
      const weight = noteWeight(note.type);
      windows.push({ note, startMs, endMs, weight });
    }
  }
  return windows;
}

function noteWeight(type: NoteType): number {
  if (type === "golden") return 2;
  if (type === "rap" || type === "freestyle") return 0.5;
  return 1;
}

// ── Pitch comparison ─────────────────────────────────────────────────────────

function hzToMidi(hz: number): number {
  return 69 + 12 * Math.log2(hz / 440);
}

/** Semitone distance between two pitches, octave-agnostic (0-6 range) */
function pitchClassDistance(midiA: number, midiB: number): number {
  const classA = ((Math.round(midiA) % 12) + 12) % 12;
  const classB = ((Math.round(midiB) % 12) + 12) % 12;
  const diff = Math.abs(classA - classB);
  return Math.min(diff, 12 - diff);
}

function gradeNote(
  detectedHz: number,
  rms: number,
  note: Note,
  mode: ScoringMode
): NoteGrade {
  if (note.type === "rap" || note.type === "freestyle") {
    return rms > NOISE_FLOOR ? "good" : "miss";
  }

  if (detectedHz <= 0 || rms < NOISE_FLOOR) return "miss";

  const detectedMidi = hzToMidi(detectedHz);
  const dist = pitchClassDistance(detectedMidi, note.pitch);

  if (mode === "expert") {
    if (dist <= 1) return "perfect";
    if (dist <= 2) return "good";
    return "miss";
  }

  // Fun mode: wider tolerance, energy boost
  if (dist <= 1) return "perfect";
  if (dist <= 2) return "good";
  if (dist <= 4) return "ok";
  // In fun mode, singing loud on any pitch counts as OK
  if (rms > 0.06) return "ok";
  return "miss";
}

// ── Scoring state exposed to UI ──────────────────────────────────────────────

export interface NoteScoringState {
  /** Running score 0-100 */
  liveScore: number;
  /** Current streak count */
  streak: number;
  /** Best streak achieved this turn */
  bestStreak: number;
  /** Current streak tier (null if streak < 5) */
  streakTier: StreakTier | null;
  /** Whether streak just crossed into a new tier (for animation triggers) */
  streakTierUp: boolean;
  /** Last note grade (for visual effects) */
  lastGrade: NoteGrade | null;
  /** Grade distribution counters */
  perfects: number;
  goods: number;
  oks: number;
  misses: number;
  /** Golden notes hit (graded good+) */
  goldenHits: number;
  /** Total golden notes encountered */
  goldenTotal: number;
  /** Total notes scored so far */
  notesScored: number;
  /** Consecutive misses (for background red effect) */
  consecutiveMisses: number;
  /** Whether we are in an active note right now */
  inNote: boolean;
}

const INITIAL_STATE: NoteScoringState = {
  liveScore: 0,
  streak: 0,
  bestStreak: 0,
  streakTier: null,
  streakTierUp: false,
  lastGrade: null,
  perfects: 0,
  goods: 0,
  oks: 0,
  misses: 0,
  goldenHits: 0,
  goldenTotal: 0,
  notesScored: 0,
  consecutiveMisses: 0,
  inNote: false,
};

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useNoteScoring(
  extractedData: DataFormat | null,
  scoringMode: ScoringMode
) {
  const [state, setState] = useState<NoteScoringState>(INITIAL_STATE);

  const noteWindows = useMemo(
    () => (extractedData ? buildNoteWindows(extractedData) : []),
    [extractedData]
  );

  const totalWeight = useMemo(
    () => noteWindows.reduce((sum, w) => sum + w.weight, 0),
    [noteWindows]
  );

  // Internal accumulators (refs to avoid re-renders on every frame)
  const accWeightedScore = useRef(0);
  const accStreak = useRef(0);
  const accBestStreak = useRef(0);
  const accPerfects = useRef(0);
  const accGoods = useRef(0);
  const accOks = useRef(0);
  const accMisses = useRef(0);
  const accGoldenHits = useRef(0);
  const accGoldenTotal = useRef(0);
  const accNotesScored = useRef(0);
  const accConsecutiveMisses = useRef(0);
  const lastGradeRef = useRef<NoteGrade | null>(null);

  // Track which notes we've already graded (by index into noteWindows)
  const gradedNotes = useRef(new Set<number>());
  // Low-water-mark: all notes before this index have been graded or passed
  const missScanStart = useRef(0);
  // For each active note, accumulate per-frame pitch samples to pick best grade
  const activeNoteIdx = useRef(-1);
  const activeNoteGrades = useRef<NoteGrade[]>([]);

  const prevStreakTier = useRef<StreakTier | null>(null);

  const reset = useCallback(() => {
    accWeightedScore.current = 0;
    accStreak.current = 0;
    accBestStreak.current = 0;
    accPerfects.current = 0;
    accGoods.current = 0;
    accOks.current = 0;
    accMisses.current = 0;
    accGoldenHits.current = 0;
    accGoldenTotal.current = 0;
    accNotesScored.current = 0;
    accConsecutiveMisses.current = 0;
    lastGradeRef.current = null;
    gradedNotes.current = new Set();
    missScanStart.current = 0;
    activeNoteIdx.current = -1;
    activeNoteGrades.current = [];
    prevStreakTier.current = null;
    setState(INITIAL_STATE);
  }, []);

  /**
   * Called on each animation frame (or throttled ~10fps) with current
   * playback position and live mic data.
   * Returns the freshly computed state snapshot so callers don't need
   * to wait for the async React setState to propagate.
   */
  const tick = useCallback(
    (currentPositionMs: number, pitchHz: number, rms: number): NoteScoringState => {
      if (noteWindows.length === 0 || totalWeight === 0) return INITIAL_STATE;

      // Binary search for current note
      let currentNoteIdx = -1;
      let lo = 0;
      let hi = noteWindows.length - 1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        const w = noteWindows[mid]!;
        if (currentPositionMs < w.startMs) {
          hi = mid - 1;
        } else if (currentPositionMs >= w.endMs) {
          lo = mid + 1;
        } else {
          currentNoteIdx = mid;
          break;
        }
      }

      const inNote = currentNoteIdx >= 0;

      if (inNote && currentNoteIdx !== activeNoteIdx.current) {
        // Finalize previous active note if it wasn't finalized
        if (
          activeNoteIdx.current >= 0 &&
          !gradedNotes.current.has(activeNoteIdx.current)
        ) {
          finalizeNote(activeNoteIdx.current);
        }
        // Start tracking new note
        activeNoteIdx.current = currentNoteIdx;
        activeNoteGrades.current = [];
      }

      if (inNote) {
        const w = noteWindows[currentNoteIdx]!;
        const frameGrade = gradeNote(pitchHz, rms, w.note, scoringMode);
        activeNoteGrades.current.push(frameGrade);
      } else if (
        activeNoteIdx.current >= 0 &&
        !gradedNotes.current.has(activeNoteIdx.current)
      ) {
        // We've left the active note window -- finalize it
        finalizeNote(activeNoteIdx.current);
        activeNoteIdx.current = -1;
        activeNoteGrades.current = [];
      }

      // Grade any skipped notes (very short notes we never entered).
      // Start from low-water-mark and break as soon as we hit a future note.
      while (missScanStart.current < noteWindows.length) {
        const i = missScanStart.current;
        if (i === activeNoteIdx.current) {
          missScanStart.current++;
          continue;
        }
        const w = noteWindows[i]!;
        if (currentPositionMs < w.endMs) break;
        if (!gradedNotes.current.has(i)) {
          gradedNotes.current.add(i);
          applyGrade("miss", w);
        }
        missScanStart.current++;
      }

      const liveScore =
        totalWeight > 0
          ? Math.min(
              100,
              Math.round((accWeightedScore.current / totalWeight) * 100)
            )
          : 0;

      const currentTier = getStreakTier(accStreak.current);
      const tierUp =
        currentTier !== null &&
        currentTier !== prevStreakTier.current &&
        accStreak.current > 0;
      if (tierUp) {
        prevStreakTier.current = currentTier;
      }

      const snapshot: NoteScoringState = {
        liveScore,
        streak: accStreak.current,
        bestStreak: accBestStreak.current,
        streakTier: currentTier,
        streakTierUp: tierUp,
        lastGrade: lastGradeRef.current,
        perfects: accPerfects.current,
        goods: accGoods.current,
        oks: accOks.current,
        misses: accMisses.current,
        goldenHits: accGoldenHits.current,
        goldenTotal: accGoldenTotal.current,
        notesScored: accNotesScored.current,
        consecutiveMisses: accConsecutiveMisses.current,
        inNote,
      };

      setState(snapshot);
      return snapshot;
    },
    [noteWindows, totalWeight, scoringMode]
  );

  function finalizeNote(idx: number) {
    gradedNotes.current.add(idx);
    const w = noteWindows[idx]!;
    const samples = activeNoteGrades.current;
    // Pick best grade from accumulated samples
    const best = bestGrade(samples);
    applyGrade(best, w);
  }

  function applyGrade(grade: NoteGrade, w: NoteWindow) {
    accNotesScored.current++;
    lastGradeRef.current = grade;

    if (w.note.type === "golden") {
      accGoldenTotal.current++;
    }

    // Score points for this note
    const tier = getStreakTier(accStreak.current);
    const multiplier = tier?.multiplier ?? 1;
    let points = 0;
    switch (grade) {
      case "perfect":
        points = w.weight * 1.0 * multiplier;
        break;
      case "good":
        points = w.weight * 0.75 * multiplier;
        break;
      case "ok":
        points = w.weight * 0.4 * multiplier;
        break;
      case "miss":
        points = 0;
        break;
    }
    accWeightedScore.current += points;

    // Update grade counters
    switch (grade) {
      case "perfect":
        accPerfects.current++;
        break;
      case "good":
        accGoods.current++;
        break;
      case "ok":
        accOks.current++;
        break;
      case "miss":
        accMisses.current++;
        break;
    }

    // Golden note tracking
    if (
      w.note.type === "golden" &&
      (grade === "perfect" || grade === "good")
    ) {
      accGoldenHits.current++;
    }

    // Streak logic
    const isHit = grade === "perfect" || grade === "good" || grade === "ok";
    if (isHit) {
      accStreak.current++;
      accConsecutiveMisses.current = 0;
      if (accStreak.current > accBestStreak.current) {
        accBestStreak.current = accStreak.current;
      }
    } else {
      // Fun mode: streak breaks after 2 consecutive misses
      accConsecutiveMisses.current++;
      if (
        scoringMode === "fun"
          ? accConsecutiveMisses.current >= 2
          : true
      ) {
        accStreak.current = 0;
        prevStreakTier.current = null;
      }
    }
  }

  /** Returns a snapshot of the current accumulators for final scoring */
  const getAccumulators = useCallback(() => {
    return {
      weightedScore: accWeightedScore.current,
      totalWeight,
      perfects: accPerfects.current,
      goods: accGoods.current,
      oks: accOks.current,
      misses: accMisses.current,
      goldenHits: accGoldenHits.current,
      goldenTotal: accGoldenTotal.current,
      bestStreak: accBestStreak.current,
      notesScored: accNotesScored.current,
    };
  }, [totalWeight]);

  return { state, tick, reset, getAccumulators };
}

function bestGrade(samples: NoteGrade[]): NoteGrade {
  if (samples.length === 0) return "miss";
  const order: NoteGrade[] = ["perfect", "good", "ok", "miss"];
  for (const g of order) {
    // Consider a grade achieved if >= 30% of samples hit it or better
    const count = samples.filter((s) => gradeRank(s) <= gradeRank(g)).length;
    if (count / samples.length >= 0.3) return g;
  }
  return "miss";
}

function gradeRank(g: NoteGrade): number {
  switch (g) {
    case "perfect":
      return 0;
    case "good":
      return 1;
    case "ok":
      return 2;
    case "miss":
      return 3;
  }
}
