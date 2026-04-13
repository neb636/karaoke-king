import { useRef, useCallback } from "react";
import { pick } from "@/lib/utils";
import { NOISE_FLOOR } from "@/lib/constants";
import type { ScoringMode } from "@/types";
import type { NoteScoringState } from "./useNoteScoring";
import {
  QUIET_MSGS,
  LOUD_MSGS,
  MEDIUM_MSGS,
  STREAK_5_MSGS,
  STREAK_10_MSGS,
  STREAK_20_MSGS,
  STREAK_30_MSGS,
  STREAK_BROKEN_MSGS,
  GOLDEN_HIT_MSGS,
  PITCH_COACHING_MSGS,
  FINISH_STRONG_MSGS,
} from "@/data/feedbackMessages";

export interface PerformanceFeedback {
  message: string;
  colorClass: string;
}

const EMPTY: PerformanceFeedback = { message: "", colorClass: "" };

const FEEDBACK_COOLDOWN_MS = 1500;
const QUIET_THRESHOLD = 3;

/**
 * Generates performance-reactive feedback messages based on note scoring
 * state, volume, and streak milestones. Returns a callback that should be
 * called on each stats update (~10fps).
 */
export function usePerformanceFeedback(
  scoringMode: ScoringMode,
  isCurated: boolean,
  songDurationMs?: number
) {
  const lastFeedbackTime = useRef(0);
  const lastStreak = useRef(0);
  const lastStreakTierLabel = useRef<string | null>(null);
  const quietFrames = useRef(0);
  const loudFrames = useRef(0);
  const lastNotesScored = useRef(0);
  const lastGoldenHits = useRef(0);
  const finishStrongShown = useRef(false);
  const recentMisses = useRef(0);

  const reset = useCallback(() => {
    lastFeedbackTime.current = 0;
    lastStreak.current = 0;
    lastStreakTierLabel.current = null;
    quietFrames.current = 0;
    loudFrames.current = 0;
    lastNotesScored.current = 0;
    lastGoldenHits.current = 0;
    finishStrongShown.current = false;
    recentMisses.current = 0;
  }, []);

  /**
   * Evaluate and return feedback. Priority order:
   * 1. Streak tier-up milestone
   * 2. Streak broken (from significant streak)
   * 3. Golden note hit
   * 4. End-of-song encouragement
   * 5. Pitch coaching (expert only, when struggling)
   * 6. Volume-based feedback (quiet/loud/medium)
   */
  const evaluate = useCallback(
    (
      noteState: NoteScoringState | null,
      rms: number,
      elapsed: number,
      currentPositionMs: number,
      inActiveNote: boolean
    ): PerformanceFeedback => {
      if (elapsed < 1.5) return EMPTY;

      const now = performance.now();
      if (now - lastFeedbackTime.current < FEEDBACK_COOLDOWN_MS) return EMPTY;

      let result: PerformanceFeedback | null = null;

      if (noteState && isCurated) {
        // 1. Streak tier-up milestone
        if (
          noteState.streakTierUp &&
          noteState.streakTier &&
          noteState.streakTier.label !== lastStreakTierLabel.current
        ) {
          lastStreakTierLabel.current = noteState.streakTier.label;
          const msgs =
            noteState.streak >= 30
              ? STREAK_30_MSGS
              : noteState.streak >= 20
                ? STREAK_20_MSGS
                : noteState.streak >= 10
                  ? STREAK_10_MSGS
                  : STREAK_5_MSGS;
          result = { message: pick(msgs), colorClass: "neon-gold" };
        }

        // 2. Streak broken (only if it was significant)
        if (
          !result &&
          lastStreak.current >= 5 &&
          noteState.streak === 0
        ) {
          result = { message: pick(STREAK_BROKEN_MSGS), colorClass: "neon-cyan" };
        }

        // 3. Golden note hit
        if (
          !result &&
          noteState.goldenHits > lastGoldenHits.current
        ) {
          lastGoldenHits.current = noteState.goldenHits;
          result = { message: pick(GOLDEN_HIT_MSGS), colorClass: "neon-gold" };
        }

        // 4. End-of-song encouragement
        if (
          !result &&
          !finishStrongShown.current &&
          songDurationMs &&
          currentPositionMs > 0 &&
          songDurationMs - currentPositionMs < 15000
        ) {
          finishStrongShown.current = true;
          result = { message: pick(FINISH_STRONG_MSGS), colorClass: "neon-pink" };
        }

        // 5. Pitch coaching (expert mode, struggling)
        if (
          !result &&
          scoringMode === "expert" &&
          noteState.notesScored > 5 &&
          noteState.notesScored > lastNotesScored.current
        ) {
          const recentTotal = noteState.notesScored;
          const hitRate =
            (noteState.perfects + noteState.goods) / recentTotal;
          if (hitRate < 0.3) {
            recentMisses.current++;
            if (recentMisses.current >= 3) {
              result = { message: pick(PITCH_COACHING_MSGS), colorClass: "neon-cyan" };
              recentMisses.current = 0;
            }
          } else {
            recentMisses.current = 0;
          }
        }

        lastStreak.current = noteState.streak;
        lastNotesScored.current = noteState.notesScored;
      }

      // 6. Volume-based feedback (only during active note sections, not instrumentals)
      if (!result) {
        const shouldCheckVolume = !isCurated || inActiveNote;

        if (rms < NOISE_FLOOR * 1.5) {
          quietFrames.current++;
          loudFrames.current = 0;
          if (shouldCheckVolume && quietFrames.current >= QUIET_THRESHOLD) {
            result = { message: pick(QUIET_MSGS), colorClass: "neon-pink" };
          }
        } else if (rms > 0.08) {
          loudFrames.current++;
          quietFrames.current = 0;
          if (loudFrames.current >= 2) {
            result = { message: pick(LOUD_MSGS), colorClass: "neon-gold" };
          }
        } else {
          quietFrames.current = 0;
          loudFrames.current = 0;
          if (Math.random() < 0.2) {
            result = { message: pick(MEDIUM_MSGS), colorClass: "neon-cyan" };
          }
        }
      }

      if (result) {
        lastFeedbackTime.current = now;
        return result;
      }

      return EMPTY;
    },
    [isCurated, scoringMode, songDurationMs]
  );

  return { evaluate, reset };
}
