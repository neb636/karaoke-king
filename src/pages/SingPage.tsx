import { useNavigate } from "react-router";
import { NeonText } from "@/components/NeonText";
import { Button } from "@/components/ui/button";
import { AudioVisualizer } from "@/components/AudioVisualizer";
import { EnergyBar } from "@/components/EnergyBar";
import { FeedbackToast } from "@/components/FeedbackToast";
import { CountdownOverlay } from "@/components/CountdownOverlay";
import { useGameStore } from "@/store/gameStore";
import { useAudio } from "@/features/audio/useAudio";
import { useCountdown } from "@/hooks/useCountdown";
import { formatTime } from "@/lib/utils";
import { PLAYER_COLORS } from "@/lib/constants";
import { useState } from "react";

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

  const { isListening, stats, feedback, freqArray, initAudio, startListening, stopListening, playSound } =
    useAudio();
  const { isActive: countdownActive, value: countdownValue, run: runCountdown } = useCountdown();

  const [showReadyOverlay, setShowReadyOverlay] = useState(true);

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
    runCountdown(() => {
      startListening();
    }, playSound);
  }

  function handleStop() {
    if (!player) return;
    const score = stopListening(player.bumpers);
    playSound(400, 150);
    recordScore(score);

    const nextPlayerIdx = currentPlayer + 1;
    if (nextPlayerIdx < players.length) {
      // More players — advance then show the next player's ready overlay
      advancePlayer();
      setTimeout(() => {
        setShowReadyOverlay(true);
      }, 600);
    } else {
      // Last player done — navigate without advancing so currentPlayer stays valid
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
          <p className="text-sm opacity-35 mb-1 tracking-[2px]">
            Singer {currentPlayer + 1} of {players.length}
          </p>
          {totalRounds > 1 && (
            <p className="text-sm opacity-30 mb-8 tracking-[2px]">
              Round {currentRound} of {totalRounds}
            </p>
          )}
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
        className="text-[clamp(2rem,6vw,4rem)] mb-8"
      >
        {player?.name || `Player ${currentPlayer + 1}`}
      </NeonText>

      <AudioVisualizer freqArray={freqArray} isActive={isListening} />

      <FeedbackToast message={feedback.message} colorClass={feedback.colorClass} />

      <EnergyBar percent={stats.energyPct} />

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
          ⏹ Stop
        </Button>
      )}

      {!isListening && !showReadyOverlay && !countdownActive && (
        <p className="text-sm opacity-40 mt-3">
          SING YOUR HEART OUT! Hit STOP when done.
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
