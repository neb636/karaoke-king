import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
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
  const { playMode, setPlayMode, selectedRegion, setRegion, clearPlayerSongs, setPickingPlayer } = useSongStore();

  function handleConfirm() {
    confirmMode();
    initNewGame();
    if (playMode === "curated") {
      clearPlayerSongs();
      setPickingPlayer(0);
      void navigate("/songs");
    } else {
      void navigate("/sing");
    }
  }

  return (
    <div className="screen-container gap-0 px-5 py-5">
      {/* Back button */}
      <button
        onClick={() => void navigate("/players")}
        className="absolute top-4 left-4 flex items-center gap-1.5 text-white/40 hover:text-white/80 transition-colors text-sm"
      >
        <ArrowLeft size={16} />
        <span className="tracking-wide">Players</span>
      </button>

      <NeonText as="h2" color="pink" className="text-[clamp(1.4rem,4vw,3rem)] mb-1">
        CHOOSE YOUR BATTLE
      </NeonText>
      <p className="text-[clamp(0.7rem,1.5vw,0.95rem)] uppercase tracking-[3px] opacity-50 mb-4">
        Select Game Mode
      </p>

      <div className="mb-3">
        <PlayModeToggle mode={playMode} onChange={setPlayMode} />
      </div>

      {playMode === "curated" && (
        <div className="mb-3 flex flex-col items-center gap-2.5">
          {/* Prominent Spotify Premium callout */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1DB954]/10 border border-[#1DB954]/30">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#1DB954] flex-shrink-0" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            <span className="text-xs font-semibold text-[#1DB954]">Spotify Premium required for curated mode</span>
          </div>
          <RegionPicker selected={selectedRegion} onChange={setRegion} />
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
