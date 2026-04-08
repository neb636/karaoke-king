import { useNavigate } from "react-router";
import { useState, useCallback, useEffect } from "react";
import { useGameStore } from "@/store/gameStore";
import { useSongStore } from "@/store/songStore";
import { useAudio } from "@/features/audio/useAudio";
import { useCountdown } from "@/hooks/useCountdown";
import { useSpotifyPlayback } from "@/hooks/useSpotifyPlayback";
import { useCoachingCues } from "@/hooks/useCoachingCues";
import { useSongData } from "@/hooks/useSongData";
import { useLyricsV2 } from "@/hooks/useLyricsV2";
import { getExpectedPitchClasses } from "@/data/songs/songData";
import { DIFFICULTY_MODIFIERS } from "@/lib/constants";

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
  } = useGameStore();

  const { playMode, getPlayerSong } = useSongStore();
  const song = getPlayerSong(currentPlayer);
  const isCurated = playMode === "curated" && !!song;

  const { extractedData, isLoading: songDataLoading } = useSongData(
    isCurated ? (song?.id ?? null) : null
  );
  const expectedPitchClasses = extractedData ? getExpectedPitchClasses(extractedData) : undefined;

  const {
    isListening,
    stats,
    feedback,
    freqArray,
    initAudio,
    startListening,
    stopListening,
    playSound,
  } = useAudio(expectedPitchClasses);

  const { isActive: countdownActive, value: countdownValue, run: runCountdown } = useCountdown();

  const [showReadyOverlay, setShowReadyOverlay] = useState(true);
  const [finishSecondsLeft, setFinishSecondsLeft] = useState(FINISH_EARLY_TIMER_SECONDS);

  // Reset overlay when player changes
  useEffect(() => {
    setShowReadyOverlay(true);
  }, [currentPlayer]);

  // Reset finish countdown when listening starts
  useEffect(() => {
    if (isListening) setFinishSecondsLeft(FINISH_EARLY_TIMER_SECONDS);
  }, [isListening]);

  // Tick the finish countdown
  useEffect(() => {
    if (!isListening || !isCurated || finishSecondsLeft <= 0) return;
    const t = setTimeout(() => setFinishSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(t);
  }, [isListening, isCurated, finishSecondsLeft]);

  const finishTimerDone = finishSecondsLeft === 0;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleTrackEnd = useCallback(() => handleStop(), []);

  const {
    isPlaying: spotifyPlaying,
    currentPositionMs,
    error: spotifyError,
    play: spotifyPlay,
    pause: spotifyPause,
  } = useSpotifyPlayback({ onTrackEnd: handleTrackEnd });

  const { currentCue } = useCoachingCues(
    isCurated && coachingEnabled ? song!.id : null,
    currentPositionMs,
    extractedData
  );

  const { prevLine, activeLine, nextLine, activeSyllableIdx, activeLineHasGolden } = useLyricsV2(
    extractedData,
    currentPositionMs
  );

  const player = players[currentPlayer];

  async function handleStartSinging() {
    setShowReadyOverlay(false);
    try {
      await initAudio();
    } catch {
      setShowReadyOverlay(true);
      return;
    }
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
    const score = stopListening(player.bumpers, {
      mode: isCurated ? scoringMode : "fun",
      expectedPitchClasses,
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

  const turnLabel =
    totalRounds > 1
      ? `ROUND ${currentRound}/${totalRounds} — SINGER ${currentPlayer + 1} OF ${players.length}`
      : `SINGER ${currentPlayer + 1} OF ${players.length}`;

  const playerName = player?.name || `Player ${currentPlayer + 1}`;

  return (
    <div className="screen-container px-4 sm:px-8 relative">
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
        />
      )}

      <CountdownOverlayV2 isActive={countdownActive} value={countdownValue} />

      {/* ── Main singing UI ───────────────────────────────────── */}
      <div className="flex flex-col items-center gap-2 sm:gap-3 w-full max-w-[640px]">
        {/* Header: turn label + player name + song (combined) */}
        <HeaderV2
          playerName={playerName}
          turnLabel={turnLabel}
          isCurated={isCurated}
          isListening={isListening}
          songTitle={isCurated ? song.title : undefined}
          songArtist={isCurated ? song.artist : undefined}
        />

        {/* Feedback / coaching (fixed height, no layout shift) */}
        <FeedbackFloatV2
          coachingCue={isCurated && coachingEnabled ? currentCue : null}
          feedbackMessage={feedback.message}
          feedbackColor={feedback.colorClass}
          showCoaching={isCurated && coachingEnabled}
        />

        {isListening ? (
          <>
            {/* Lyrics card (curated only) */}
            {extractedData && (
              <LyricsCardV2
                prevLine={prevLine}
                activeLine={activeLine}
                nextLine={nextLine}
                activeSyllableIdx={activeSyllableIdx}
                activeLineHasGolden={activeLineHasGolden}
              />
            )}

            {/* Freeform encouragement */}
            {!isCurated && (
              <p className="font-display text-[clamp(1.8rem,5vw,3rem)] tracking-[4px] neon-pink text-center animate-pulse-mic">
                SING IT!
              </p>
            )}

            {/* Visualizer */}
            <VisualizerV2 freqArray={freqArray} isActive={isListening} />

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
            />
          </>
        ) : !showReadyOverlay && !countdownActive ? (
          <p className="text-sm opacity-40 mt-3">
            {isCurated ? "Sing along with the track!" : "SING YOUR HEART OUT! Hit STOP when done."}
          </p>
        ) : null}
      </div>

      <DebugPanel
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
        feedback={feedback}
        activeLine={activeLine}
        spotifyError={spotifyError}
      />
    </div>
  );
}
