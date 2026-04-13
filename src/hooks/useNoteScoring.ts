import { useRef, useMemo, useCallback, useState } from "react";
import type { DataFormat } from "@/types/songs";
import type { ScoringMode } from "@/types";
import {
  type NoteGrade,
  type NoteWindow,
  type StreakTier,
  buildNoteWindows,
  gradeNote,
  getStreakTier,
  bestGrade,
} from "@/features/scoring/noteGrading";

// Re-export types that external consumers depend on
export type { NoteGrade, StreakTier } from "@/features/scoring/noteGrading";
export { STREAK_TIERS, getStreakTier } from "@/features/scoring/noteGrading";

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

  const gradedNotes = useRef(new Set<number>());
  const missScanStart = useRef(0);
  const activeNoteIdx = useRef(-1);
  const activeNoteGrades = useRef<NoteGrade[]>([]);

  const prevStreakTier = useRef<StreakTier | null>(null);
  const prevSnapshotKey = useRef("");

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
    prevSnapshotKey.current = "";
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
        if (
          activeNoteIdx.current >= 0 &&
          !gradedNotes.current.has(activeNoteIdx.current)
        ) {
          finalizeNote(activeNoteIdx.current);
        }
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
        finalizeNote(activeNoteIdx.current);
        activeNoteIdx.current = -1;
        activeNoteGrades.current = [];
      }

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

      // Only trigger a React re-render when values actually changed
      const key = `${liveScore}|${snapshot.streak}|${snapshot.bestStreak}|${snapshot.lastGrade}|${snapshot.perfects}|${snapshot.goods}|${snapshot.oks}|${snapshot.misses}|${snapshot.notesScored}|${snapshot.consecutiveMisses}|${inNote}|${tierUp}`;
      if (key !== prevSnapshotKey.current) {
        prevSnapshotKey.current = key;
        setState(snapshot);
      }

      return snapshot;
    },
    [noteWindows, totalWeight, scoringMode]
  );

  function finalizeNote(idx: number) {
    gradedNotes.current.add(idx);
    const w = noteWindows[idx]!;
    const samples = activeNoteGrades.current;
    const best = bestGrade(samples);
    applyGrade(best, w);
  }

  function applyGrade(grade: NoteGrade, w: NoteWindow) {
    accNotesScored.current++;
    lastGradeRef.current = grade;

    if (w.note.type === "golden") {
      accGoldenTotal.current++;
    }

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

    if (
      w.note.type === "golden" &&
      (grade === "perfect" || grade === "good")
    ) {
      accGoldenHits.current++;
    }

    const isHit = grade === "perfect" || grade === "good" || grade === "ok";
    if (isHit) {
      accStreak.current++;
      accConsecutiveMisses.current = 0;
      if (accStreak.current > accBestStreak.current) {
        accBestStreak.current = accStreak.current;
      }
    } else {
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
