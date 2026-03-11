import { useNavigate } from "react-router";
import { NeonText } from "@/components/NeonText";
import { Button } from "@/components/ui/button";
import { AudioVisualizer } from "@/components/AudioVisualizer";
import { EnergyBar } from "@/components/EnergyBar";
import { FeedbackToast } from "@/components/FeedbackToast";
import { CountdownOverlay } from "@/components/CountdownOverlay";
import { SongInfoBanner } from "@/components/SongInfoBanner";
import { CoachingPrompt } from "@/components/CoachingPrompt";
import { useGameStore } from "@/store/gameStore";
import { useSongStore } from "@/store/songStore";
import { useAudio } from "@/features/audio/useAudio";
import { useCountdown } from "@/hooks/useCountdown";
import { useSpotifyPlayback } from "@/hooks/useSpotifyPlayback";
import { useCoachingCues } from "@/hooks/useCoachingCues";
import { formatTime } from "@/lib/utils";
import { PLAYER_COLORS, DIFFICULTY_MODIFIERS } from "@/lib/constants";
import { useState, useCallback } from "react";

export function SingPage() {
  const navigate = useNavigate();
  const {
    players,
    currentPlayer,
    currentRound,
    totalRounds,
    recordScore,
    advancePlayer,
  } = useGameStore();

  const { playMode, getCurrentSong } = useSongStore();
  const song = getCurrentSong();
  const isCurated = playMode === "curated" && !!song;

  const { isListening, stats, feedback, freqArray, initAudio, startListening, stopListening, playSound } =
    useAudio();
  const { isActive: countdownActive, value: countdownValue, run: runCountdown } = useCountdown();

  const [showReadyOverlay, setShowReadyOverlay] = useState(true);

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
    isCurated ? song.id : null,
    currentPositionMs,
  );

  const player = players[currentPlayer];
  const color = player ? PLAYER_COLORS[currentPlayer % PLAYER_COLORS.length]! : PLAYER_COLORS[0]!;

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
    const score = stopListening(player.bumpers);

    // Apply difficulty modifier for curated mode
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
        setShowReadyOverlay(true);
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
    <div className="screen-container px-10 relative">
      {/* Ready overlay */}
      {showReadyOverlay && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[rgba(10,10,26,0.92)] z-10">
          <NeonText
            as="div"
            color={color.name as "pink" | "cyan" | "gold" | "green"}
            className="text-[clamp(2.5rem,7vw,5rem)] mb-3"
          >
            {player?.name || `Player ${currentPlayer + 1}`}
          </NeonText>
          <p className="text-lg opacity-60 mb-3 tracking-[2px]">GET READY TO SING!</p>

          {isCurated && (
            <div className="mb-3 text-center">
              <p className="text-sm neon-pink font-bold">{song.title}</p>
              <p className="text-xs text-white/50">{song.artist}</p>
            </div>
          )}

          <p className="text-sm opacity-35 mb-1 tracking-[2px]">
            Singer {currentPlayer + 1} of {players.length}
          </p>
          {totalRounds > 1 && (
            <p className="text-sm opacity-30 tracking-[2px]">
              Round {currentRound} of {totalRounds}
            </p>
          )}

          {currentPlayer === 0 && currentRound === 1 && (
            <div className="mt-5 mb-5 px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-center space-y-1">
              <p className="text-xs uppercase tracking-[2px] opacity-40 mb-2">How to play</p>
              {isCurated ? (
                <>
                  <p className="text-sm opacity-60">🎵 Music plays right here in your browser</p>
                  <p className="text-sm opacity-60">🎤 Sing along near your microphone</p>
                  <p className="text-sm opacity-60">🔊 Make sure your volume is up!</p>
                </>
              ) : (
                <>
                  <p className="text-sm opacity-60">🎵 Play a song in the background</p>
                  <p className="text-sm opacity-60">🎤 Sing near your device's microphone</p>
                </>
              )}
            </div>
          )}

          {!(currentPlayer === 0 && currentRound === 1) && <div className="mb-8" />}

          <Button variant="pink" onClick={() => void handleStartSinging()}>
            🎤 Start Singing
          </Button>
        </div>
      )}

      {/* Countdown overlay */}
      <CountdownOverlay isActive={countdownActive} value={countdownValue} />

      {/* Main sing UI */}
      <p className="text-base uppercase tracking-[4px] opacity-60 mb-2">{turnLabel}</p>
      <NeonText
        as="h2"
        color={color.name as "pink" | "cyan" | "gold" | "green"}
        className="text-[clamp(2rem,6vw,4rem)] mb-4"
      >
        {player?.name || `Player ${currentPlayer + 1}`}
      </NeonText>

      {isCurated && isListening && (
        <SongInfoBanner title={song.title} artist={song.artist} />
      )}

      {/* Coaching prompt (curated) or feedback toast (freeform) */}
      {isCurated && currentCue ? (
        <CoachingPrompt cue={currentCue} />
      ) : (
        <FeedbackToast message={feedback.message} colorClass={feedback.colorClass} />
      )}

      <AudioVisualizer freqArray={freqArray} isActive={isListening} />

      <EnergyBar percent={stats.energyPct} />

      {/* Spotify error */}
      {spotifyError && (
        <p className="text-xs text-[#ff2d95] mt-1">
          Spotify: {spotifyError}
        </p>
      )}

      {/* Stats row */}
      <div className="flex gap-10 my-6">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[2px] opacity-50 mb-1">Time</div>
          <div className="text-3xl font-extrabold neon-cyan">{formatTime(stats.elapsed)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs uppercase tracking-[2px] opacity-50 mb-1">Energy</div>
          <div className="text-3xl font-extrabold neon-pink">{stats.avgEnergy}</div>
        </div>
        <div className="text-center">
          <div className="text-xs uppercase tracking-[2px] opacity-50 mb-1">Pitch Hits</div>
          <div className="text-3xl font-extrabold neon-gold">{stats.pitchHits}</div>
        </div>
      </div>

      {isListening && (
        <Button variant="red" onClick={handleStop}>
          {isCurated ? "🏁 Finish Early" : "⏹ Stop"}
        </Button>
      )}

      {!isListening && !showReadyOverlay && !countdownActive && (
        <p className="text-sm opacity-40 mt-3">
          {isCurated ? "Sing along with the track!" : "SING YOUR HEART OUT! Hit STOP when done."}
        </p>
      )}
      {showReadyOverlay && (
        <p className="text-sm opacity-40 mt-3">
          Hit the button when you're ready to sing!
        </p>
      )}
    </div>
  );
}
