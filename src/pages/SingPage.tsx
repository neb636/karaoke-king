import { useNavigate } from "react-router";
import { NeonText } from "@/components/NeonText";
import { Button } from "@/components/ui/button";
import { AudioVisualizer } from "@/components/AudioVisualizer";
import { EnergyBar } from "@/components/EnergyBar";
import { FeedbackToast } from "@/components/FeedbackToast";
import { CountdownOverlay } from "@/components/CountdownOverlay";
import { SongInfoBanner } from "@/components/SongInfoBanner";
import { CoachingPrompt } from "@/components/CoachingPrompt";
import { ReadyOverlay } from "@/components/ReadyOverlay";
import { StatsStrip } from "@/components/StatsStrip";
import { useGameStore } from "@/store/gameStore";
import { useSongStore } from "@/store/songStore";
import { useAudio } from "@/features/audio/useAudio";
import { useCountdown } from "@/hooks/useCountdown";
import { useSpotifyPlayback } from "@/hooks/useSpotifyPlayback";
import { useCoachingCues } from "@/hooks/useCoachingCues";
import { DIFFICULTY_MODIFIERS } from "@/lib/constants";
import { getSongExtractedData, getExpectedPitchClasses } from "@/data/songs/songData";
import { useLyrics } from "@/hooks/useLyrics";
import { LyricsDisplay } from "@/components/LyricsDisplay";
import { useState, useCallback, useEffect } from "react";

const FINISH_EARLY_TIMER_SECONDS = 40;

export function SingPage() {
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

  const extractedData =
    isCurated && song ? getSongExtractedData(song.id) : null;
  const expectedPitchClasses = extractedData ? getExpectedPitchClasses(extractedData) : undefined;

  const { isListening, stats, feedback, freqArray, initAudio, startListening, stopListening, playSound } =
    useAudio(expectedPitchClasses);
  const { isActive: countdownActive, value: countdownValue, run: runCountdown } = useCountdown();

  const [showReadyOverlay, setShowReadyOverlay] = useState(true);
  const [finishSecondsLeft, setFinishSecondsLeft] = useState(FINISH_EARLY_TIMER_SECONDS);

  useEffect(() => {
    setShowReadyOverlay(true);
  }, [currentPlayer]);

  useEffect(() => {
    if (isListening) {
      setFinishSecondsLeft(FINISH_EARLY_TIMER_SECONDS);
    }
  }, [isListening]);

  useEffect(() => {
    if (!isListening || !isCurated || finishSecondsLeft <= 0) return;
    const t = setTimeout(() => setFinishSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(t);
  }, [isListening, isCurated, finishSecondsLeft]);

  const finishTimerDone = finishSecondsLeft === 0;

  const handleTrackEnd = useCallback(() => {
    handleStop();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    extractedData,
  );

  const { prevLine, activeLine, nextLine, activeSyllableIdx, activeLineHasGolden } =
    useLyrics(extractedData, currentPositionMs);

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

  return (
    <div className="screen-container px-8 relative">
      {showReadyOverlay && (
        <ReadyOverlay
          playerName={player?.name || `Player ${currentPlayer + 1}`}
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
        />
      )}

      <CountdownOverlay isActive={countdownActive} value={countdownValue} />

      <div className="flex items-center gap-3 mb-4 self-stretch justify-center flex-wrap">
        <p className="text-xs uppercase tracking-[3px] opacity-50">{turnLabel}</p>
        {isCurated && isListening && (
          <>
            <span className="text-white/20 text-xs">·</span>
            <SongInfoBanner title={song.title} artist={song.artist} compact />
          </>
        )}
      </div>

      <NeonText
        as="h2"
        color="pink"
        className="text-[clamp(1.8rem,5vw,3.2rem)] mb-2 leading-none"
      >
        {player?.name || `Player ${currentPlayer + 1}`}
      </NeonText>

      {isCurated && currentCue && coachingEnabled ? (
        <CoachingPrompt cue={currentCue} />
      ) : (
        <FeedbackToast message={feedback.message} colorClass={feedback.colorClass} />
      )}

      {extractedData && isListening && (
        <LyricsDisplay
          prevLine={prevLine}
          activeLine={activeLine}
          nextLine={nextLine}
          activeSyllableIdx={activeSyllableIdx}
          activeLineHasGolden={activeLineHasGolden}
        />
      )}

      {isListening ? (
        <>
          <AudioVisualizer freqArray={freqArray} isActive={isListening} />
          <div className="mt-2 w-full max-w-[600px]">
            <EnergyBar percent={stats.energyPct} />
          </div>

          {spotifyError && (
            <p className="text-xs text-[#ff2d95] mt-1">
              Spotify: {spotifyError}
            </p>
          )}

          <StatsStrip
            elapsed={stats.elapsed}
            avgEnergy={stats.avgEnergy}
            pitchHits={stats.pitchHits}
            noteAccuracy={stats.noteAccuracy}
            isCurated={isCurated}
            scoringMode={scoringMode}
          />

          <Button
            variant="red"
            size="sm"
            onClick={handleStop}
            disabled={isCurated && !finishTimerDone}
          >
            {isCurated
              ? finishTimerDone
                ? "🏁 Finish Early"
                : `🏁 Finish Early (${finishSecondsLeft}s)`
              : "⏹ Stop"}
          </Button>
        </>
      ) : !showReadyOverlay && !countdownActive ? (
        <p className="text-sm opacity-40 mt-3">
          {isCurated ? "Sing along with the track!" : "SING YOUR HEART OUT! Hit STOP when done."}
        </p>
      ) : null}
    </div>
  );
}
