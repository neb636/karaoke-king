import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import { useGameStore } from "@/store/gameStore";
import { useSongStore } from "@/store/songStore";
import { useAudio } from "@/features/audio/useAudio";
import { useCountdown } from "@/hooks/useCountdown";
import { useSpotifyPlayback } from "@/hooks/useSpotifyPlayback";
import { useCoachingCues } from "@/hooks/useCoachingCues";
import { useSongData } from "@/hooks/useSongData";
import { useLyrics } from "@/hooks/useLyrics";
import { useNoteScoring } from "@/hooks/useNoteScoring";
import { usePerformanceFeedback } from "@/hooks/usePerformanceFeedback";
import { useSingSession } from "@/hooks/useSingSession";
import { getExpectedPitchClasses } from "@/data/songs/songData";
import { derivePerformanceVisuals } from "@/lib/performance";
import { isDebugMode } from "./sing-page-v2/components/DebugPanel";

import { ReadyOverlayV2 } from "./sing-page-v2/components/ReadyOverlayV2";
import { CountdownOverlayV2 } from "./sing-page-v2/components/CountdownOverlayV2";
import { HeaderV2 } from "./sing-page-v2/components/HeaderV2";
import { FeedbackFloatV2 } from "./sing-page-v2/components/FeedbackFloatV2";
import { LyricsCardV2 } from "./sing-page-v2/components/LyricsCardV2";
import { VisualizerV2 } from "./sing-page-v2/components/VisualizerV2";
import { BottomBarV2 } from "./sing-page-v2/components/BottomBarV2";
import { DebugPanel } from "./sing-page-v2/components/DebugPanel";

export function SingPageV2() {
  const navigate = useNavigate();
  const {
    players,
    currentPlayer,
    currentRound,
    totalRounds,
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

  const {
    isPlaying: spotifyPlaying,
    currentPositionMs,
    error: spotifyError,
    play: spotifyPlay,
    pause: spotifyPause,
  } = useSpotifyPlayback({ onTrackEnd: () => handleStop() });

  const {
    state: noteScoring,
    tick: noteScoringTick,
    reset: noteScoringReset,
    getAccumulators: getNoteAccumulators,
  } = useNoteScoring(
    isCurated ? effectiveExtractedData ?? null : null,
    scoringMode
  );

  const songDurationMs = isCurated ? song.durationMs : undefined;
  const { evaluate: evaluateFeedback, reset: resetFeedback } = usePerformanceFeedback(
    scoringMode,
    isCurated,
    songDurationMs
  );

  const [perfFeedback, setPerfFeedback] = useState({ message: "", colorClass: "" });
  const clearPerfFeedback = useCallback(() => setPerfFeedback({ message: "", colorClass: "" }), []);

  const {
    showReadyOverlay,
    finishSecondsLeft,
    finishTimerDone,
    handleStart,
    handleStop,
    handleDebugRestart,
  } = useSingSession({
    isCurated,
    song: isCurated ? song : null,
    expectedPitchClasses,
    initAudio,
    startListening,
    stopListening,
    playSound,
    isListening,
    spotifyPlaying,
    spotifyPlay,
    spotifyPause,
    runCountdown,
    noteScoringReset,
    resetFeedback,
    getNoteAccumulators,
    clearPerfFeedback,
  });

  // Drive note scoring from the audio tick (~10fps via stats updates).
  const lastNoteTickMs = useRef(0);
  useEffect(() => {
    if (!isListening || !isCurated) return;
    const now = performance.now();
    if (now - lastNoteTickMs.current < 90) return;
    lastNoteTickMs.current = now;

    const freshScoring = noteScoringTick(currentPositionMs, livePitchHz.current, liveRms.current);

    const fb = evaluateFeedback(
      freshScoring,
      liveRms.current,
      stats.elapsed,
      currentPositionMs,
      freshScoring.inNote
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
    livePitchHz,
    liveRms,
  ]);

  const activeFeedback = isCurated ? perfFeedback : audioFeedback;

  const { currentCue } = useCoachingCues(
    isCurated && coachingEnabled ? song!.id : null,
    currentPositionMs,
    extractedData
  );

  const { prevLine, activeLine, nextLine, activeSyllableIdx, activeLineHasGolden } = useLyrics(
    effectiveExtractedData,
    currentPositionMs
  );

  const player = players[currentPlayer];

  const { mood: visualizerMood, bgClass: bgPerformanceClass } = useMemo(
    () => derivePerformanceVisuals(noteScoring, isCurated),
    [noteScoring, isCurated]
  );

  const turnLabel =
    totalRounds > 1
      ? `ROUND ${currentRound}/${totalRounds} — SINGER ${currentPlayer + 1} OF ${players.length}`
      : `SINGER ${currentPlayer + 1} OF ${players.length}`;

  const playerName = player?.name || `Player ${currentPlayer + 1}`;

  return (
    <div className={`screen-container px-4 sm:px-8 relative transition-all duration-500 ${bgPerformanceClass}`}>
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
          onStartSinging={() => void handleStart()}
          onBack={() => void navigate(isCurated ? "/songs" : "/mode")}
          isLoadingSongData={songDataLoading}
          scoringMode={scoringMode}
          onScoringModeChange={setScoringMode}
        />
      )}

      <CountdownOverlayV2 isActive={countdownActive} value={countdownValue} />

      <div className="flex flex-col items-center gap-2 sm:gap-3 w-full max-w-[640px]">
        <HeaderV2
          playerName={playerName}
          turnLabel={turnLabel}
          isCurated={isCurated}
          isListening={isListening}
          songTitle={isCurated ? song.title : undefined}
          songArtist={isCurated ? song.artist : undefined}
        />

        <FeedbackFloatV2
          coachingCue={isCurated && coachingEnabled ? currentCue : null}
          feedbackMessage={activeFeedback.message}
          feedbackColor={activeFeedback.colorClass}
          showCoaching={isCurated && coachingEnabled}
        />

        {isListening ? (
          <>
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

            {!isCurated && (
              <p className="font-display text-[clamp(1.8rem,5vw,3rem)] tracking-[4px] neon-pink text-center animate-pulse-mic">
                SING IT!
              </p>
            )}

            <VisualizerV2
              freqArray={freqArray}
              isActive={isListening}
              mood={visualizerMood}
            />

            {spotifyError && <p className="text-xs text-[#ff2d95]">Spotify: {spotifyError}</p>}

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
