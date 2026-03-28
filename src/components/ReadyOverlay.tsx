import { ArrowLeft } from "lucide-react";
import { NeonText } from "@/components/NeonText";
import { Button } from "@/components/ui/button";

interface ReadyOverlayProps {
  playerName: string;
  currentPlayer: number;
  currentRound: number;
  totalRounds: number;
  playersCount: number;
  isCurated: boolean;
  songTitle?: string;
  songArtist?: string;
  coachingEnabled: boolean;
  onToggleCoaching: () => void;
  onStartSinging: () => void;
  onBack: () => void;
}

export function ReadyOverlay({
  playerName,
  currentPlayer,
  currentRound,
  totalRounds,
  playersCount,
  isCurated,
  songTitle,
  songArtist,
  coachingEnabled,
  onToggleCoaching,
  onStartSinging,
  onBack,
}: ReadyOverlayProps) {
  const isFirstTurn = currentPlayer === 0 && currentRound === 1;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[rgba(10,10,26,0.95)] z-10 px-6">
      {isFirstTurn && (
        <button
          onClick={onBack}
          className="absolute top-4 left-4 flex items-center gap-1.5 text-white/40 hover:text-white/80 transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          <span className="tracking-wide">Back</span>
        </button>
      )}

      <NeonText as="div" color="pink" className="text-[clamp(2.5rem,7vw,5rem)] mb-2">
        {playerName}
      </NeonText>
      <p className="text-lg opacity-60 mb-2 tracking-[2px]">GET READY TO SING!</p>

      {isCurated && songTitle && (
        <div className="mb-2 text-center">
          <p className="text-sm neon-pink font-bold">{songTitle}</p>
          <p className="text-xs text-white/50">{songArtist}</p>
        </div>
      )}

      <p className="text-sm opacity-35 mb-0.5 tracking-[2px]">
        Singer {currentPlayer + 1} of {playersCount}
      </p>
      {totalRounds > 1 && (
        <p className="text-sm opacity-30 tracking-[2px]">
          Round {currentRound} of {totalRounds}
        </p>
      )}

      {isFirstTurn && (
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

      {!isFirstTurn && <div className="mb-5" />}

      {isCurated && (
        <div className="mb-4 flex items-center gap-2">
          <button
            onClick={onToggleCoaching}
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

      <div className="text-4xl animate-pulse-mic mb-4">🎤</div>

      <Button variant="pink" onClick={onStartSinging}>
        Start Singing
      </Button>
    </div>
  );
}
