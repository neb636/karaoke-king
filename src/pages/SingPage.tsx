import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
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
import { useSettingsStore } from "@/store/settingsStore";
import { useAudio } from "@/features/audio/useAudio";
import { useCountdown } from "@/hooks/useCountdown";
import { useSpotifyPlayback } from "@/hooks/useSpotifyPlayback";
import { useCoachingCues } from "@/hooks/useCoachingCues";
import { formatTime } from "@/lib/utils";
import { DIFFICULTY_MODIFIERS } from "@/lib/constants";
import { getSongExtractedData, getExpectedPitchClasses } from "@/data/songs/songData";
import { useState, useCallback, useEffect } from "react";

const START_SINGING_TIMER_SECONDS = 50;

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

  const { playMode, getPlayerSong } = useSongStore();
  const { coachingEnabled, toggleCoaching, scoringMode } = useSettingsStore();
  const song = getPlayerSong(currentPlayer);
  const isCurated = playMode === "curated" && !!song;

  const extractedData =
    isCurated && scoringMode === "expert" && song ? getSongExtractedData(song.id) : null;
  const expectedPitchClasses = extractedData ? getExpectedPitchClasses(extractedData) : undefined;

  const { isListening, stats, feedback, freqArray, initAudio, startListening, stopListening, playSound } =
    useAudio(expectedPitchClasses);
  const { isActive: countdownActive, value: countdownValue, run: runCountdown } = useCountdown();

  const [showReadyOverlay, setShowReadyOverlay] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(START_SINGING_TIMER_SECONDS);

  useEffect(() => {
    if (showReadyOverlay) {
      setSecondsLeft(START_SINGING_TIMER_SECONDS);
    }
  }, [showReadyOverlay]);

  useEffect(() => {
    if (!showReadyOverlay || secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(t);
  }, [showReadyOverlay, secondsLeft]);

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
    isCurated && coachingEnabled ? song.id : null,
    currentPositionMs,
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
        void navigate("/songs");
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
      {/* Ready overlay */}
      {showReadyOverlay && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[rgba(10,10,26,0.95)] z-10 px-6">
          {/* Back button — only on first player's first turn */}
          {currentPlayer === 0 && currentRound === 1 && (
            <button
              onClick={() => void navigate(isCurated ? "/songs" : "/mode")}
              className="absolute top-4 left-4 flex items-center gap-1.5 text-white/40 hover:text-white/80 transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              <span className="tracking-wide">Back</span>
            </button>
          )}

          <NeonText
            as="div"
            color="pink"
            className="text-[clamp(2.5rem,7vw,5rem)] mb-2"
          >
            {player?.name || `Player ${currentPlayer + 1}`}
          </NeonText>
          <p className="text-lg opacity-60 mb-2 tracking-[2px]">GET READY TO SING!</p>

          {isCurated && (
            <div className="mb-2 text-center">
              <p className="text-sm neon-pink font-bold">{song.title}</p>
              <p className="text-xs text-white/50">{song.artist}</p>
            </div>
          )}

          <p className="text-sm opacity-35 mb-0.5 tracking-[2px]">
            Singer {currentPlayer + 1} of {players.length}
          </p>
          {totalRounds > 1 && (
            <p className="text-sm opacity-30 tracking-[2px]">
              Round {currentRound} of {totalRounds}
            </p>
          )}

          {currentPlayer === 0 && currentRound === 1 && (
            <div className="mt-4 mb-4 px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-center space-y-1">
              <p className="text-xs uppercase tracking-[2px] opacity-40 mb-1.5">How to play</p>
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

          {!(currentPlayer === 0 && currentRound === 1) && <div className="mb-5" />}

          {/* Coaching toggle for curated mode */}
          {isCurated && (
            <div className="mb-4 flex items-center gap-2">
              <button
                onClick={toggleCoaching}
                className={[
                  "relative w-9 h-5 rounded-full border transition-all duration-200 flex-shrink-0",
                  coachingEnabled
                    ? "bg-[#00e5ff]/20 border-[#00e5ff]/50"
                    : "bg-white/[0.06] border-white/15",
                ].join(" ")}
                aria-label="Toggle coaching tips"
              >
                <span
                  className={[
                    "absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200",
                    coachingEnabled
                      ? "left-[calc(100%-1.1rem)] bg-[#00e5ff]"
                      : "left-0.5 bg-white/30",
                  ].join(" ")}
                />
              </button>
              <span className="text-xs text-white/50 tracking-wide">
                Coaching tips {coachingEnabled ? "on" : "off"}
              </span>
            </div>
          )}

          {/* Pulsing mic idle state */}
          <div className="text-4xl animate-pulse-mic mb-4">🎤</div>

          <Button
            variant="pink"
            onClick={() => void handleStartSinging()}
          >
           Start Singing
          </Button>

         
        </div>
      )}

      {/* Countdown overlay */}
      <CountdownOverlay isActive={countdownActive} value={countdownValue} />

      {/* Main sing UI — compact header row */}
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

      {/* Coaching prompt or feedback toast */}
      {isCurated && currentCue && coachingEnabled ? (
        <CoachingPrompt cue={currentCue} />
      ) : (
        <FeedbackToast message={feedback.message} colorClass={feedback.colorClass} />
      )}

      {isListening ? (
        <>
          <AudioVisualizer freqArray={freqArray} isActive={isListening} />
          <div className="mt-2 w-full max-w-[600px]">
            <EnergyBar percent={stats.energyPct} />
          </div>

          {/* Spotify error */}
          {spotifyError && (
            <p className="text-xs text-[#ff2d95] mt-1">
              Spotify: {spotifyError}
            </p>
          )}

          {/* Compact stats strip */}
          <div className="flex gap-2 mt-3 mb-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08]">
              <span className="text-[10px] uppercase tracking-[2px] opacity-40">Time</span>
              <span className="text-xl font-extrabold neon-cyan tabular-nums">{formatTime(stats.elapsed)}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08]">
              <span className="text-[10px] uppercase tracking-[2px] opacity-40">Energy</span>
              <span className="text-xl font-extrabold neon-pink tabular-nums">{stats.avgEnergy}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08]">
              <span className="text-[10px] uppercase tracking-[2px] opacity-40">
                {isCurated && scoringMode === "expert" ? "Note Acc" : "Pitch Hits"}
              </span>
              <span className="text-xl font-extrabold neon-gold tabular-nums">
                {isCurated && scoringMode === "expert"
                  ? `${stats.noteAccuracy}%`
                  : stats.pitchHits}
              </span>
            </div>
          </div>

          <Button variant="red" size="sm" onClick={handleStop}>
            {isCurated ? "🏁 Finish Early" : "⏹ Stop"}
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
