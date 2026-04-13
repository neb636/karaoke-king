import { useCallback, useRef, useState } from "react";
import { FEEDBACK_COOLDOWN, NOISE_FLOOR } from "@/lib/constants";
import { pick } from "@/lib/utils";
import { LOUD_MSGS, MEDIUM_MSGS, QUIET_MSGS } from "@/data/feedbackMessages";
import {
  calculatePitchClassAccuracy,
  calculateScore,
  detectPitch,
} from "@/features/scoring/scoring";
import type { ScoreOptions } from "@/features/scoring/scoring";
import type { PlayerScore } from "@/types";
import * as audioManager from "@/services/audioManager";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LiveStats {
  elapsed: number;
  energyPct: number;
  avgEnergy: number;
  pitchHits: number;
  noteAccuracy: number;
}

export interface FeedbackState {
  message: string;
  colorClass: string;
}

export interface AudioHook {
  isListening: boolean;
  stats: LiveStats;
  feedback: FeedbackState;
  dataArray: React.MutableRefObject<Uint8Array>;
  freqArray: React.MutableRefObject<Uint8Array>;
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  /** Raw detected pitch in Hz, updated every animation frame. -1 = no pitch detected. */
  livePitchHz: React.MutableRefObject<number>;
  /** Raw RMS energy, updated every animation frame. */
  liveRms: React.MutableRefObject<number>;
  initAudio: () => Promise<void>;
  startListening: () => void;
  stopListening: (hasBumpers: boolean, options?: ScoreOptions) => PlayerScore;
  playSound: (frequency?: number, duration?: number) => void;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAudio(expectedPitchClasses?: Set<number>): AudioHook {
  const [isListening, setIsListening] = useState(false);
  const [stats, setStats] = useState<LiveStats>({
    elapsed: 0,
    energyPct: 0,
    avgEnergy: 0,
    pitchHits: 0,
    noteAccuracy: 0,
  });
  const expectedPitchClassesRef = useRef<Set<number> | undefined>(expectedPitchClasses);
  expectedPitchClassesRef.current = expectedPitchClasses;
  const [feedback, setFeedback] = useState<FeedbackState>({
    message: "",
    colorClass: "",
  });

  // Per-turn accumulators (refs — mutated every animation frame)
  const turnStart = useRef(0);
  const frameCount = useRef(0);
  const totalRMS = useRef(0);
  const activeFrames = useRef(0);
  const pitchBuckets = useRef(new Set<number>());
  const pitchClasses = useRef(new Set<number>());
  const lastPitchBucket = useRef(-1);
  const animFrameId = useRef<number | null>(null);
  const isListeningRef = useRef(false);

  // Feedback state (refs to avoid stale closures in the RAF loop)
  const lastFeedbackTime = useRef(0);
  const quietStreak = useRef(0);
  const loudStreak = useRef(0);

  // Shared typed-array buffers
  const dataArray = useRef<Uint8Array>(new Uint8Array(0));
  const freqArray = useRef<Uint8Array>(new Uint8Array(0));
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Live per-frame values for external consumers (e.g. useNoteScoring)
  const livePitchHz = useRef(-1);
  const liveRms = useRef(0);

  // ── Sound effects ────────────────────────────────────────────────────────

  const playSound = useCallback((frequency = 800, duration = 100) => {
    try {
      const ctx = audioManager.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = frequency;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration / 1000);
    } catch {
      // Audio might be unavailable — silently ignore
    }
  }, []);

  // ── Mic init ─────────────────────────────────────────────────────────────

  const initAudio = useCallback(async () => {
    await audioManager.init();
    const analyserNode = audioManager.getAnalyser();
    if (analyserNode) {
      dataArray.current = new Uint8Array(analyserNode.fftSize);
      freqArray.current = new Uint8Array(analyserNode.frequencyBinCount);
      analyserRef.current = analyserNode;
    }
  }, []);

  // ── Live feedback logic ───────────────────────────────────────────────────

  const updateFeedback = useCallback((rms: number, elapsed: number) => {
    if (elapsed < 1.5) return;
    const now = performance.now();
    if (now - lastFeedbackTime.current < FEEDBACK_COOLDOWN) return;

    let message = "";
    let colorClass = "";

    if (rms < NOISE_FLOOR * 1.5) {
      quietStreak.current++;
      loudStreak.current = 0;
      if (quietStreak.current >= 3) {
        message = pick(QUIET_MSGS);
        colorClass = "neon-pink";
      }
    } else if (rms > 0.08) {
      loudStreak.current++;
      quietStreak.current = 0;
      if (loudStreak.current >= 2) {
        message = pick(LOUD_MSGS);
        colorClass = "neon-gold";
      }
    } else {
      quietStreak.current = 0;
      loudStreak.current = 0;
      if (Math.random() < 0.3) {
        message = pick(MEDIUM_MSGS);
        colorClass = "neon-cyan";
      }
    }

    if (message) {
      setFeedback({ message, colorClass });
      lastFeedbackTime.current = now;
    }
  }, []);

  // ── Animation frame loop ─────────────────────────────────────────────────

  const lastStatsUpdate = useRef(0);

  const tick = useCallback(() => {
    const analyserNode = audioManager.getAnalyser();
    if (!isListeningRef.current || !analyserNode) return;
    animFrameId.current = requestAnimationFrame(tick);

    analyserNode.getByteTimeDomainData(dataArray.current);
    analyserNode.getByteFrequencyData(freqArray.current);

    // RMS
    let sum = 0;
    for (let i = 0; i < dataArray.current.length; i++) {
      const v = (dataArray.current[i]! - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / dataArray.current.length);
    liveRms.current = rms;
    frameCount.current++;
    totalRMS.current += rms;
    if (rms > NOISE_FLOOR) activeFrames.current++;

    // Pitch
    const sampleRate = audioManager.getSampleRate();
    const pitch = detectPitch(dataArray.current, sampleRate);
    livePitchHz.current = pitch;
    if (pitch > 0) {
      const bucket = Math.round(12 * Math.log2(pitch / 440));
      pitchBuckets.current.add(bucket);
      pitchClasses.current.add(((bucket % 12) + 12) % 12);
      lastPitchBucket.current = bucket;
    }

    // UI update — throttled to ~10fps to avoid 60fps React re-renders
    const now = performance.now();
    if (now - lastStatsUpdate.current >= 100) {
      lastStatsUpdate.current = now;
      const elapsed = (now - turnStart.current) / 1000;
      const energyPct = Math.min(100, Math.round(rms * 400));
      const avgEnergy = Math.round(
        frameCount.current > 0 ? (totalRMS.current / frameCount.current) * 300 : 0
      );
      const expected = expectedPitchClassesRef.current;
      const noteAccuracy =
        expected && expected.size > 0
          ? calculatePitchClassAccuracy(pitchClasses.current, expected)
          : 0;
      setStats({
        elapsed,
        energyPct,
        avgEnergy,
        pitchHits: pitchBuckets.current.size,
        noteAccuracy,
      });
      updateFeedback(rms, elapsed);
    }
  }, [updateFeedback]);

  // ── Start / Stop ──────────────────────────────────────────────────────────

  const startListening = useCallback(() => {
    frameCount.current = 0;
    totalRMS.current = 0;
    activeFrames.current = 0;
    pitchBuckets.current = new Set();
    pitchClasses.current = new Set();
    lastPitchBucket.current = -1;
    quietStreak.current = 0;
    loudStreak.current = 0;
    lastFeedbackTime.current = 0;
    lastStatsUpdate.current = 0;
    turnStart.current = performance.now();
    isListeningRef.current = true;
    setIsListening(true);
    setStats({ elapsed: 0, energyPct: 0, avgEnergy: 0, pitchHits: 0, noteAccuracy: 0 });
    setFeedback({ message: "", colorClass: "" });
    tick();
  }, [tick]);

  const stopListening = useCallback(
    (hasBumpers: boolean, options: ScoreOptions = { mode: "fun" }): PlayerScore => {
      isListeningRef.current = false;
      setIsListening(false);
      if (animFrameId.current !== null) {
        cancelAnimationFrame(animFrameId.current);
        animFrameId.current = null;
      }

      const elapsed = (performance.now() - turnStart.current) / 1000;

      return calculateScore(
        {
          frameCount: frameCount.current,
          totalRMS: totalRMS.current,
          activeFrames: activeFrames.current,
          pitchBuckets: pitchBuckets.current,
          pitchClasses: pitchClasses.current,
          elapsed,
          hasBumpers,
        },
        options
      );
    },
    []
  );

  return {
    isListening,
    stats,
    feedback,
    dataArray,
    freqArray,
    analyserRef,
    livePitchHz,
    liveRms,
    initAudio,
    startListening,
    stopListening,
    playSound,
  };
}
