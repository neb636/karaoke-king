import { useNavigate } from "react-router";
import { NeonText } from "@/components/NeonText";
import { Button } from "@/components/ui/button";
import { ModeCard } from "@/components/ModeCard";
import { PlayModeToggle } from "@/components/PlayModeToggle";
import { RegionPicker } from "@/components/RegionPicker";
import { useGameStore } from "@/store/gameStore";
import { useSongStore } from "@/store/songStore";
import { GAME_MODES, GAME_MODE_KEYS } from "@/lib/constants";

export function ModeSelectPage() {
  const navigate = useNavigate();
  const { selectedMode, setSelectedMode, confirmMode, initNewGame } = useGameStore();
  const { playMode, setPlayMode, selectedRegion, setRegion } = useSongStore();

  function handleConfirm() {
    confirmMode();
    initNewGame();
    if (playMode === "curated") {
      void navigate("/songs");
    } else {
      void navigate("/sing");
    }
  }

  return (
    <div className="screen-container gap-0 px-5 py-5">
      <NeonText as="h2" color="pink" className="text-[clamp(1.4rem,4vw,3rem)] mb-1">
        CHOOSE YOUR BATTLE
      </NeonText>
      <p className="text-[clamp(0.7rem,1.5vw,0.95rem)] uppercase tracking-[3px] opacity-50 mb-4">
        Select Game Mode
      </p>

      <div className="mb-4">
        <PlayModeToggle mode={playMode} onChange={setPlayMode} />
      </div>

      {playMode === "curated" && (
        <div className="mb-4 flex flex-col items-center gap-2">
          <RegionPicker selected={selectedRegion} onChange={setRegion} />
          <p className="text-xs opacity-30 tracking-wider">
            Requires Spotify Premium
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-[min(96vw,860px)] mb-6">
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
        className="text-[clamp(0.9rem,2vw,1.2rem)] px-[clamp(28px,5vw,48px)] py-[clamp(10px,2vh,16px)]"
        onClick={handleConfirm}
      >
        Let's Go! 🎤
      </Button>
    </div>
  );
}
