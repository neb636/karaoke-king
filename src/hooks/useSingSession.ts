import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useGameStore } from "@/store/gameStore";
import { useSongStore } from "@/store/songStore";
import { DIFFICULTY_MODIFIERS } from "@/lib/constants";
import type { CuratedSong } from "@/types/songs";
import type { ScoreOptions } from "@/features/scoring/scoring";
import type { PlayerScore } from "@/types";

const FINISH_EARLY_TIMER_SECONDS = 40;

interface SingSessionDeps {
  isCurated: boolean;
  song: CuratedSong | null;
  expectedPitchClasses: Set<number> | undefined;
  initAudio: () => Promise<void>;
  startListening: () => void;
  stopListening: (hasBumpers: boolean, options?: ScoreOptions) => PlayerScore;
  playSound: (frequency?: number, duration?: number) => void;
  isListening: boolean;
  spotifyPlaying: boolean;
  spotifyPlay: (uri: string) => Promise<void>;
  spotifyPause: () => Promise<void>;
  runCountdown: (onDone: () => void, playSound?: (freq: number, dur: number) => void) => void;
  noteScoringReset: () => void;
  resetFeedback: () => void;
  getNoteAccumulators: () => { totalWeight: number; weightedScore: number; perfects: number; goods: number; oks: number; misses: number; goldenHits: number; goldenTotal: number; bestStreak: number; notesScored: number };
  clearPerfFeedback: () => void;
}

export function useSingSession(deps: SingSessionDeps) {
  const navigate = useNavigate();
  const {
    players,
    currentPlayer,
    recordScore,
    advancePlayer,
    scoringMode,
  } = useGameStore();

  const { playMode } = useSongStore();

  const [showReadyOverlay, setShowReadyOverlay] = useState(true);
  const [finishSecondsLeft, setFinishSecondsLeft] = useState(FINISH_EARLY_TIMER_SECONDS);

  useEffect(() => {
    setShowReadyOverlay(true);
  }, [currentPlayer]);

  useEffect(() => {
    if (deps.isListening) setFinishSecondsLeft(FINISH_EARLY_TIMER_SECONDS);
  }, [deps.isListening]);

  useEffect(() => {
    if (!deps.isListening || !deps.isCurated || finishSecondsLeft <= 0) return;
    const t = setTimeout(() => setFinishSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(t);
  }, [deps.isListening, deps.isCurated, finishSecondsLeft]);

  const finishTimerDone = finishSecondsLeft === 0;

  const player = players[currentPlayer];

  const handleStop = useCallback(() => {
    if (!player) return;

    const noteAcc = deps.isCurated ? deps.getNoteAccumulators() : undefined;

    const score = deps.stopListening(player.bumpers, {
      mode: deps.isCurated ? scoringMode : "fun",
      expectedPitchClasses: deps.expectedPitchClasses,
      noteAccumulators: noteAcc && noteAcc.totalWeight > 0 ? noteAcc : undefined,
    });

    if (deps.isCurated && deps.song) {
      const modifier = DIFFICULTY_MODIFIERS[deps.song.difficulty] ?? 1.0;
      score.total = Math.min(100, Math.round(score.total * modifier));
    }

    if (deps.isCurated && deps.spotifyPlaying) {
      void deps.spotifyPause();
    }

    deps.playSound(400, 150);
    recordScore(score);

    const nextPlayerIdx = currentPlayer + 1;
    if (nextPlayerIdx < players.length) {
      advancePlayer();
      setTimeout(() => {
        void navigate(playMode === "curated" ? "/songs" : "/sing");
      }, 600);
    } else {
      setTimeout(() => {
        void navigate("/results");
      }, 800);
    }
  }, [
    player, deps, scoringMode, recordScore,
    currentPlayer, players.length, advancePlayer, navigate, playMode,
  ]);

  const handleStopRef = useRef(handleStop);
  handleStopRef.current = handleStop;
  const stableHandleStop = useCallback(() => handleStopRef.current(), []);

  const handleStart = useCallback(async () => {
    setShowReadyOverlay(false);
    try {
      await deps.initAudio();
    } catch {
      setShowReadyOverlay(true);
      return;
    }
    deps.noteScoringReset();
    deps.resetFeedback();
    deps.clearPerfFeedback();
    deps.playSound(900, 100);
    deps.runCountdown(async () => {
      deps.startListening();
      if (deps.isCurated && deps.song) {
        await deps.spotifyPlay(deps.song.spotifyUri);
      }
    }, deps.playSound);
  }, [deps]);

  const handleDebugRestart = useCallback(async () => {
    if (deps.isCurated && deps.spotifyPlaying) {
      await deps.spotifyPause();
    }
    deps.stopListening(player?.bumpers ?? false, { mode: "fun" });
    deps.noteScoringReset();
    deps.resetFeedback();
    deps.clearPerfFeedback();
    setShowReadyOverlay(true);
  }, [deps, player]);

  return {
    showReadyOverlay,
    finishSecondsLeft,
    finishTimerDone,
    handleStart,
    handleStop: stableHandleStop,
    handleDebugRestart,
  };
}
