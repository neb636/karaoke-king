import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { useSongStore } from "@/store/songStore";

export function SpotifyPremiumGate() {
  const navigate = useNavigate();
  const { setPlayMode } = useSongStore();

  function handleFreeform() {
    setPlayMode("freeform");
    void navigate("/sing");
  }

  return (
    <div className="w-full max-w-[500px] p-5 rounded-2xl border border-[#ffd700]/30 bg-[#ffd700]/[0.05] text-center space-y-3">
      <p className="text-sm font-bold neon-gold">Spotify Premium Required</p>
      <p className="text-xs text-white/50">
        Curated mode needs Spotify Premium to play songs. You can still browse the library or switch
        to Freeform mode.
      </p>
      <Button variant="cyan" size="sm" onClick={handleFreeform}>
        Switch to Freeform
      </Button>
    </div>
  );
}
