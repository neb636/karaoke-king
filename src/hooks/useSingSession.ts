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

  // Keep a stable ref to deps so callbacks don't need to depend on the object
  const depsRef = useRef(deps);
  depsRef.current = deps;

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
    const d = depsRef.current;
    if (!player) return;

    const noteAcc = d.isCurated ? d.getNoteAccumulators() : undefined;

    const score = d.stopListening(player.bumpers, {
      mode: d.isCurated ? scoringMode : "fun",
      expectedPitchClasses: d.expectedPitchClasses,
      noteAccumulators: noteAcc && noteAcc.totalWeight > 0 ? noteAcc : undefined,
    });

    if (d.isCurated && d.song) {
      const modifier = DIFFICULTY_MODIFIERS[d.song.difficulty] ?? 1.0;
      score.total = Math.min(100, Math.round(score.total * modifier));
    }

    if (d.isCurated && d.spotifyPlaying) {
      void d.spotifyPause();
    }

    d.playSound(400, 150);
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
  }, [player, scoringMode, recordScore, currentPlayer, players.length, advancePlayer, navigate, playMode]);

  const handleStopRef = useRef(handleStop);
  handleStopRef.current = handleStop;
  const stableHandleStop = useCallback(() => handleStopRef.current(), []);

  const handleStart = useCallback(async () => {
    const d = depsRef.current;
    setShowReadyOverlay(false);
    try {
      await d.initAudio();
    } catch {
      setShowReadyOverlay(true);
      return;
    }
    d.noteScoringReset();
    d.resetFeedback();
    d.clearPerfFeedback();
    d.playSound(900, 100);
    d.runCountdown(async () => {
      d.startListening();
      if (d.isCurated && d.song) {
        try {
          await d.spotifyPlay(d.song.spotifyUri);
        } catch (err) {
          console.error("Spotify playback failed:", err);
        }
      }
    }, d.playSound);
  }, []);

  const handleDebugRestart = useCallback(async () => {
    const d = depsRef.current;
    if (d.isCurated && d.spotifyPlaying) {
      await d.spotifyPause();
    }
    d.stopListening(player?.bumpers ?? false, { mode: "fun" });
    d.noteScoringReset();
    d.resetFeedback();
    d.clearPerfFeedback();
    setShowReadyOverlay(true);
  }, [player]);

  return {
    showReadyOverlay,
    finishSecondsLeft,
    finishTimerDone,
    handleStart,
    handleStop: stableHandleStop,
    handleDebugRestart,
  };
}
