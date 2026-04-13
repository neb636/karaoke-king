import { useSpotifyStore } from "@/store/spotifyStore";

export function SpotifyStatusIndicator() {
  const { isAuthenticated, isPremium } = useSpotifyStore();

  if (!isAuthenticated) return null;

  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`w-2 h-2 rounded-full ${
          isPremium
            ? "bg-[#1DB954] shadow-[0_0_6px_#1DB954]"
            : "bg-[#ffd700] shadow-[0_0_6px_#ffd700]"
        }`}
      />
      <span className="text-[10px] text-white/40">{isPremium ? "Premium" : "Free"}</span>
    </div>
  );
}
