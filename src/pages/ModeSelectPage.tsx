import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { NeonText } from "@/components/NeonText";
import { Button } from "@/components/ui/button";
import { ModeCard } from "@/components/ModeCard";
import { PlayModeToggle } from "@/components/PlayModeToggle";
import { ScoringModeToggle } from "@/components/ScoringModeToggle";
import { useGameStore } from "@/store/gameStore";
import { useSongStore } from "@/store/songStore";
import { GAME_MODES, GAME_MODE_KEYS } from "@/lib/constants";

export function ModeSelectPage() {
  const navigate = useNavigate();
  const { selectedMode, setSelectedMode, confirmMode, initNewGame, scoringMode, setScoringMode } =
    useGameStore();
  const { playMode, setPlayMode, clearPlayerSongs } = useSongStore();

  function handleConfirm() {
    confirmMode();
    initNewGame();
    if (playMode === "curated") {
      clearPlayerSongs();
      void navigate("/songs");
    } else {
      void navigate("/sing");
    }
  }

  return (
    <div className="screen-container gap-0 px-5 py-5">
      <button
        onClick={() => void navigate("/players")}
        className="absolute top-4 left-4 flex items-center gap-1.5 text-white/40 hover:text-white/80 transition-colors text-sm"
      >
        <ArrowLeft size={16} />
        <span className="tracking-wide">Players</span>
      </button>

      <NeonText as="h2" color="pink" className="text-[clamp(1.4rem,4vw,2.6rem)] mb-5">
        CHOOSE YOUR BATTLE
      </NeonText>

      <div className="mb-4">
        <PlayModeToggle mode={playMode} onChange={setPlayMode} />
      </div>

      {playMode === "curated" && (
        <div className="mb-5 flex flex-col items-center gap-1">
          <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Scoring Style</p>
          <ScoringModeToggle mode={scoringMode} onChange={setScoringMode} />
          <p className="text-[10px] text-white/20 mt-1">
            {scoringMode === "fun" ? "Rewards energy & enthusiasm" : "Rewards pitch accuracy"}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-[min(96vw,760px)] mb-5">
        {GAME_MODE_KEYS.map((key) => (
          <ModeCard
            key={key}
            modeKey={key}
            config={GAME_MODES[key]}
            selected={selectedMode === key}
            onSelect={() => setSelectedMode(key)}
          />
        ))}
      </div>

      <Button
        variant="gold"
        className="text-[clamp(0.9rem,2vw,1.1rem)] px-[clamp(28px,5vw,44px)] py-[clamp(10px,2vh,14px)]"
        onClick={handleConfirm}
      >
        Let's Go! 🎤
      </Button>

      {playMode === "curated" && (
        <p className="mt-3 text-[10px] uppercase tracking-widest text-white/25">
          Spotify Premium required for curated mode
        </p>
      )}
    </div>
  );
}
