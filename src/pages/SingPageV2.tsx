import { useNavigate } from "react-router";
import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useGameStore } from "@/store/gameStore";
import { useSongStore } from "@/store/songStore";
import { useAudio } from "@/features/audio/useAudio";
import { useCountdown } from "@/hooks/useCountdown";
import { useSpotifyPlayback } from "@/hooks/useSpotifyPlayback";
import { useCoachingCues } from "@/hooks/useCoachingCues";
import { useSongData } from "@/hooks/useSongData";
import { useLyricsV2 } from "@/hooks/useLyricsV2";
import { useNoteScoring } from "@/hooks/useNoteScoring";
import { usePerformanceFeedback } from "@/hooks/usePerformanceFeedback";
import { getExpectedPitchClasses } from "@/data/songs/songData";
import { DIFFICULTY_MODIFIERS } from "@/lib/constants";
import { isDebugMode } from "./sing-page-v2/components/DebugPanel";
import type { VisualizerMood } from "./sing-page-v2/components/VisualizerV2";

import { ReadyOverlayV2 } from "./sing-page-v2/components/ReadyOverlayV2";
import { CountdownOverlayV2 } from "./sing-page-v2/components/CountdownOverlayV2";
import { HeaderV2 } from "./sing-page-v2/components/HeaderV2";
import { FeedbackFloatV2 } from "./sing-page-v2/components/FeedbackFloatV2";
import { LyricsCardV2 } from "./sing-page-v2/components/LyricsCardV2";
import { VisualizerV2 } from "./sing-page-v2/components/VisualizerV2";
import { BottomBarV2 } from "./sing-page-v2/components/BottomBarV2";
import { DebugPanel } from "./sing-page-v2/components/DebugPanel";

const FINISH_EARLY_TIMER_SECONDS = 40;

export function SingPageV2() {
  const navigate = useNavigate();
  const {
    players,
    currentPlayer,
    currentRound,
    totalRounds,
    recordScore,
    advancePlayer,
    coachingEnabled,
    toggleCoaching,
    scoringMode,
    setScoringMode,
  } = useGameStore();

  const { playMode, getPlayerSong } = useSongStore();
  const song = getPlayerSong(currentPlayer);
  const isCurated = playMode === "curated" && !!song;

  const { extractedData, isLoading: songDataLoading } = useSongData(
    isCurated ? (song?.id ?? null) : null
  );

  const [gapMsOverride, setGapMsOverride] = useState<number | null>(null);

  useEffect(() => {
    if (extractedData) {
      setGapMsOverride(extractedData.gapMs);
    }
  }, [extractedData?.gapMs]);

  const effectiveExtractedData = useMemo(() => {
    if (!extractedData || !isDebugMode() || gapMsOverride === null) return extractedData;
    return { ...extractedData, gapMs: gapMsOverride };
  }, [extractedData, gapMsOverride]);

  const expectedPitchClasses = extractedData ? getExpectedPitchClasses(extractedData) : undefined;

  const {
    isListening,
    stats,
    feedback: audioFeedback,
    freqArray,
    livePitchHz,
    liveRms,
    initAudio,
    startListening,
    stopListening,
    playSound,
  } = useAudio(expectedPitchClasses);

  const { isActive: countdownActive, value: countdownValue, run: runCountdown } = useCountdown();

  const [showReadyOverlay, setShowReadyOverlay] = useState(true);
  const [finishSecondsLeft, setFinishSecondsLeft] = useState(FINISH_EARLY_TIMER_SECONDS);

  useEffect(() => {
    setShowReadyOverlay(true);
  }, [currentPlayer]);

  useEffect(() => {
    if (isListening) setFinishSecondsLeft(FINISH_EARLY_TIMER_SECONDS);
  }, [isListening]);

  useEffect(() => {
    if (!isListening || !isCurated || finishSecondsLeft <= 0) return;
    const t = setTimeout(() => setFinishSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(t);
  }, [isListening, isCurated, finishSecondsLeft]);

  const finishTimerDone = finishSecondsLeft === 0;

  const handleStopRef = useRef(handleStop);
  handleStopRef.current = handleStop;

  const handleTrackEnd = useCallback(() => handleStopRef.current(), []);

  const {
    isPlaying: spotifyPlaying,
    currentPositionMs,
    error: spotifyError,
    play: spotifyPlay,
    pause: spotifyPause,
  } = useSpotifyPlayback({ onTrackEnd: handleTrackEnd });

  // Per-note scoring (curated mode only)
  const {
    state: noteScoring,
    tick: noteScoringTick,
    reset: noteScoringReset,
    getAccumulators: getNoteAccumulators,
  } = useNoteScoring(
    isCurated ? effectiveExtractedData ?? null : null,
    scoringMode
  );

  // Performance-reactive feedback
  const songDurationMs = isCurated ? song.durationMs : undefined;
  const { evaluate: evaluateFeedback, reset: resetFeedback } = usePerformanceFeedback(
    scoringMode,
    isCurated,
    songDurationMs
  );

  const [perfFeedback, setPerfFeedback] = useState({ message: "", colorClass: "" });

  // Drive note scoring from the audio tick (~10fps via stats updates)
  const lastNoteTickMs = useRef(0);
  useEffect(() => {
    if (!isListening || !isCurated) return;
    const now = performance.now();
    if (now - lastNoteTickMs.current < 90) return;
    lastNoteTickMs.current = now;

    noteScoringTick(currentPositionMs, livePitchHz.current, liveRms.current);

    const fb = evaluateFeedback(
      noteScoring,
      liveRms.current,
      stats.elapsed,
      currentPositionMs,
      noteScoring.inNote
    );
    if (fb.message) {
      setPerfFeedback(fb);
    }
  }, [
    isListening,
    isCurated,
    stats,
    currentPositionMs,
    noteScoringTick,
    evaluateFeedback,
    noteScoring,
    livePitchHz,
    liveRms,
  ]);

  // For freeform mode, use the old audio feedback
  const activeFeedback = isCurated ? perfFeedback : audioFeedback;

  const { currentCue } = useCoachingCues(
    isCurated && coachingEnabled ? song!.id : null,
    currentPositionMs,
    extractedData
  );

  const { prevLine, activeLine, nextLine, activeSyllableIdx, activeLineHasGolden } = useLyricsV2(
    effectiveExtractedData,
    currentPositionMs
  );

  const player = players[currentPlayer];

  // Compute visualizer mood and background class from note scoring state
  const visualizerMood: VisualizerMood = useMemo(() => {
    if (!isCurated || !noteScoring) return "neutral";
    if (noteScoring.streak >= 20) return "great";
    if (noteScoring.streak >= 10) return "positive";
    if (noteScoring.consecutiveMisses >= 4) return "negative";
    return "neutral";
  }, [isCurated, noteScoring]);

  const bgPerformanceClass = useMemo(() => {
    if (!isCurated || !noteScoring) return "";
    if (noteScoring.streak >= 20) return "bg-performance-great";
    if (noteScoring.streak >= 10) return "bg-performance-positive";
    if (noteScoring.consecutiveMisses >= 4) return "bg-performance-negative";
    return "";
  }, [isCurated, noteScoring]);

  async function handleStartSinging() {
    setShowReadyOverlay(false);
    try {
      await initAudio();
    } catch {
      setShowReadyOverlay(true);
      return;
    }
    noteScoringReset();
    resetFeedback();
    setPerfFeedback({ message: "", colorClass: "" });
    playSound(900, 100);
    runCountdown(async () => {
      startListening();
      if (isCurated) {
        await spotifyPlay(song.spotifyUri);
      }
    }, playSound);
  }

  function handleStop() {
    if (!player) return;

    const noteAcc = isCurated ? getNoteAccumulators() : undefined;

    const score = stopListening(player.bumpers, {
      mode: isCurated ? scoringMode : "fun",
      expectedPitchClasses,
      noteAccumulators: noteAcc && noteAcc.totalWeight > 0 ? noteAcc : undefined,
    });

    if (isCurated) {
      const modifier = DIFFICULTY_MODIFIERS[song.difficulty] ?? 1.0;
      score.total = Math.min(100, Math.round(score.total * modifier));
    }

    if (isCurated && spotifyPlaying) {
      void spotifyPause();
    }

    playSound(400, 150);
    recordScore(score);

    const nextPlayerIdx = currentPlayer + 1;
    if (nextPlayerIdx < players.length) {
      advancePlayer();
      setTimeout(() => {
        void navigate(isCurated ? "/songs" : "/sing");
      }, 600);
    } else {
      setTimeout(() => {
        void navigate("/results");
      }, 800);
    }
  }

  async function handleDebugRestart() {
    if (isCurated && spotifyPlaying) {
      await spotifyPause();
    }
    stopListening(player?.bumpers ?? false, { mode: "fun" });
    noteScoringReset();
    resetFeedback();
    setPerfFeedback({ message: "", colorClass: "" });
    setShowReadyOverlay(true);
  }

  const turnLabel =
    totalRounds > 1
      ? `ROUND ${currentRound}/${totalRounds} — SINGER ${currentPlayer + 1} OF ${players.length}`
      : `SINGER ${currentPlayer + 1} OF ${players.length}`;

  const playerName = player?.name || `Player ${currentPlayer + 1}`;

  return (
    <div className={`screen-container px-4 sm:px-8 relative transition-all duration-500 ${bgPerformanceClass}`}>
      {/* ── Overlays ──────────────────────────────────────────── */}
      {showReadyOverlay && (
        <ReadyOverlayV2
          playerName={playerName}
          currentPlayer={currentPlayer}
          currentRound={currentRound}
          totalRounds={totalRounds}
          playersCount={players.length}
          isCurated={isCurated}
          songTitle={isCurated ? song.title : undefined}
          songArtist={isCurated ? song.artist : undefined}
          coachingEnabled={coachingEnabled}
          onToggleCoaching={toggleCoaching}
          onStartSinging={() => void handleStartSinging()}
          onBack={() => void navigate(isCurated ? "/songs" : "/mode")}
          isLoadingSongData={songDataLoading}
          scoringMode={scoringMode}
          onScoringModeChange={setScoringMode}
        />
      )}

      <CountdownOverlayV2 isActive={countdownActive} value={countdownValue} />

      {/* ── Main singing UI ───────────────────────────────────── */}
      <div className="flex flex-col items-center gap-2 sm:gap-3 w-full max-w-[640px]">
        <HeaderV2
          playerName={playerName}
          turnLabel={turnLabel}
          isCurated={isCurated}
          isListening={isListening}
          songTitle={isCurated ? song.title : undefined}
          songArtist={isCurated ? song.artist : undefined}
        />

        {/* Feedback / coaching (both can show simultaneously now) */}
        <FeedbackFloatV2
          coachingCue={isCurated && coachingEnabled ? currentCue : null}
          feedbackMessage={activeFeedback.message}
          feedbackColor={activeFeedback.colorClass}
          showCoaching={isCurated && coachingEnabled}
        />

        {isListening ? (
          <>
            {/* Lyrics card (curated only) */}
            {extractedData && (
              <div className="w-full my-[10px]">
                <LyricsCardV2
                  prevLine={prevLine}
                  activeLine={activeLine}
                  nextLine={nextLine}
                  activeSyllableIdx={activeSyllableIdx}
                  activeLineHasGolden={activeLineHasGolden}
                  lastGrade={noteScoring.lastGrade}
                />
              </div>
            )}

            {/* Freeform encouragement */}
            {!isCurated && (
              <p className="font-display text-[clamp(1.8rem,5vw,3rem)] tracking-[4px] neon-pink text-center animate-pulse-mic">
                SING IT!
              </p>
            )}

            {/* Visualizer */}
            <VisualizerV2
              freqArray={freqArray}
              isActive={isListening}
              mood={visualizerMood}
            />

            {/* Spotify error */}
            {spotifyError && <p className="text-xs text-[#ff2d95]">Spotify: {spotifyError}</p>}

            {/* Bottom bar: stats + energy + stop */}
            <BottomBarV2
              elapsed={stats.elapsed}
              avgEnergy={stats.avgEnergy}
              energyPct={stats.energyPct}
              pitchHits={stats.pitchHits}
              noteAccuracy={stats.noteAccuracy}
              isCurated={isCurated}
              scoringMode={scoringMode}
              finishSecondsLeft={finishSecondsLeft}
              finishTimerDone={finishTimerDone}
              onStop={handleStop}
              noteScoring={isCurated ? noteScoring : null}
            />
          </>
        ) : !showReadyOverlay && !countdownActive ? (
          <p className="text-sm opacity-40 mt-3">
            {isCurated ? "Sing along with the track!" : "SING YOUR HEART OUT! Hit STOP when done."}
          </p>
        ) : null}
      </div>

      <DebugPanel
        extractedData={extractedData}
        songId={isCurated ? song.id : null}
        isCurated={isCurated}
        isListening={isListening}
        showReadyOverlay={showReadyOverlay}
        countdownActive={countdownActive}
        currentPlayer={currentPlayer}
        currentRound={currentRound}
        totalRounds={totalRounds}
        playersCount={players.length}
        scoringMode={scoringMode}
        coachingEnabled={coachingEnabled}
        spotifyPlaying={spotifyPlaying}
        currentPositionMs={currentPositionMs}
        finishSecondsLeft={finishSecondsLeft}
        stats={stats}
        feedback={activeFeedback}
        activeLine={activeLine}
        spotifyError={spotifyError}
        gapMs={gapMsOverride}
        onGapMsChange={setGapMsOverride}
        onRestart={() => void handleDebugRestart()}
      />
    </div>
  );
}
