import { useNavigate } from "react-router";
import { NeonText } from "@/components/NeonText";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/store/gameStore";

export function TitlePage() {
  const navigate = useNavigate();
  const resetToPlayerSetup = useGameStore((s) => s.resetToPlayerSetup);

  function handleStart() {
    resetToPlayerSetup();
    void navigate("/players");
  }

  return (
    <div className="screen-container">
      <div className="text-8xl mb-6 animate-pulse-mic">🎤</div>
      <NeonText
        as="h1"
        color="pink"
        className="text-[clamp(3rem,10vw,7rem)] leading-none mb-2"
      >
        KARAOKE KING
      </NeonText>
      <p className="text-xl opacity-70 mb-12 tracking-[3px] uppercase">
        Battle for Glory
      </p>
      <Button variant="pink" onClick={handleStart}>
        Start Game
      </Button>
    </div>
  );
}
