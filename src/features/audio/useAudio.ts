import { useCallback, useRef, useState } from "react";
import { FEEDBACK_COOLDOWN, NOISE_FLOOR } from "@/lib/constants";
import { pick } from "@/lib/utils";
import { LOUD_MSGS, MEDIUM_MSGS, QUIET_MSGS } from "@/services/mocks/feedbackMessages";
import { calculateScore, detectPitch } from "@/features/scoring/scoring";
import type { PlayerScore } from "@/types";

// ── Web Audio refs (module-level singletons) ──────────────────────────────────
// We keep these outside React state to avoid re-renders and ensure the
// AudioContext/stream persists for the entire session.
let audioCtx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let micStream: MediaStream | null = null;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LiveStats {
  elapsed: number;
  energyPct: number;
  avgEnergy: number;
  pitchHits: number;
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
  initAudio: () => Promise<void>;
  startListening: () => void;
  stopListening: (hasBumpers: boolean) => PlayerScore;
  playSound: (frequency?: number, duration?: number) => void;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAudio(): AudioHook {
  const [isListening, setIsListening] = useState(false);
  const [stats, setStats] = useState<LiveStats>({
    elapsed: 0,
    energyPct: 0,
    avgEnergy: 0,
    pitchHits: 0,
  });
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

  // ── Sound effects ────────────────────────────────────────────────────────

  const playSound = useCallback((frequency = 800, duration = 100) => {
    try {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = frequency;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.01,
        audioCtx.currentTime + duration / 1000,
      );
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + duration / 1000);
    } catch {
      // Audio might be unavailable — silently ignore
    }
  }, []);

  // ── Mic init ─────────────────────────────────────────────────────────────

  const initAudio = useCallback(async () => {
    if (audioCtx && micStream) return;
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(micStream);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);
    dataArray.current = new Uint8Array(analyser.fftSize);
    freqArray.current = new Uint8Array(analyser.frequencyBinCount);
    analyserRef.current = analyser;
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

  const tick = useCallback(() => {
    if (!isListeningRef.current || !analyser) return;
    animFrameId.current = requestAnimationFrame(tick);

    analyser.getByteTimeDomainData(dataArray.current);
    analyser.getByteFrequencyData(freqArray.current);

    // RMS
    let sum = 0;
    for (let i = 0; i < dataArray.current.length; i++) {
      const v = (dataArray.current[i]! - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / dataArray.current.length);
    frameCount.current++;
    totalRMS.current += rms;
    if (rms > NOISE_FLOOR) activeFrames.current++;

    // Pitch
    const sampleRate = audioCtx?.sampleRate ?? 44100;
    const pitch = detectPitch(dataArray.current, sampleRate);
    if (pitch > 0) {
      const bucket = Math.round(12 * Math.log2(pitch / 440));
      pitchBuckets.current.add(bucket);
      if (lastPitchBucket.current !== -1 && bucket !== lastPitchBucket.current) {
        // pitchChanges unused for scoring but tracked for future
      }
      lastPitchBucket.current = bucket;
    }

    // UI update
    const elapsed = (performance.now() - turnStart.current) / 1000;
    const energyPct = Math.min(100, Math.round(rms * 400));
    const avgEnergy = Math.round(
      frameCount.current > 0 ? (totalRMS.current / frameCount.current) * 300 : 0,
    );

    setStats({
      elapsed,
      energyPct,
      avgEnergy,
      pitchHits: pitchBuckets.current.size,
    });

    updateFeedback(rms, elapsed);
  }, [updateFeedback]);

  // ── Start / Stop ──────────────────────────────────────────────────────────

  const startListening = useCallback(() => {
    frameCount.current = 0;
    totalRMS.current = 0;
    activeFrames.current = 0;
    pitchBuckets.current = new Set();
    lastPitchBucket.current = -1;
    quietStreak.current = 0;
    loudStreak.current = 0;
    lastFeedbackTime.current = 0;
    turnStart.current = performance.now();
    isListeningRef.current = true;
    setIsListening(true);
    setFeedback({ message: "", colorClass: "" });
    tick();
  }, [tick]);

  const stopListening = useCallback(
    (hasBumpers: boolean): PlayerScore => {
      isListeningRef.current = false;
      setIsListening(false);
      if (animFrameId.current !== null) {
        cancelAnimationFrame(animFrameId.current);
        animFrameId.current = null;
      }

      const elapsed = (performance.now() - turnStart.current) / 1000;

      return calculateScore({
        frameCount: frameCount.current,
        totalRMS: totalRMS.current,
        activeFrames: activeFrames.current,
        pitchBuckets: pitchBuckets.current,
        elapsed,
        hasBumpers,
      });
    },
    [],
  );

  return {
    isListening,
    stats,
    feedback,
    dataArray,
    freqArray,
    analyserRef,
    initAudio,
    startListening,
    stopListening,
    playSound,
  };
}
