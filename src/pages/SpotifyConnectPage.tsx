import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { NeonText } from "@/components/NeonText";
import { Button } from "@/components/ui/button";
import { useSpotifyStore } from "@/store/spotifyStore";
import { USE_CODE_PASTE_FLOW } from "@/services/spotify/constants";

const SpotifyLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
);

function CodePasteFlow() {
  const navigate = useNavigate();
  const { login, handleCallback, isLoading, error } = useSpotifyStore();
  const [code, setCode] = useState("");

  const submitCode = async () => {
    if (!code.trim()) return;
    await handleCallback(code.trim());
    // Navigate on next tick — store will have updated by then
    setTimeout(() => {
      const { isAuthenticated, isPremium } = useSpotifyStore.getState();
      if (isAuthenticated && isPremium) navigate("/songs");
    }, 0);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      <p className="text-white/50 text-sm text-center leading-relaxed">
        Step 1: Open Spotify authorization (new tab)
      </p>
      <button
        onClick={() => void login()}
        className="flex items-center gap-3 px-8 py-3.5 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black text-base font-bold transition-all duration-200 hover:scale-105 shadow-[0_0_24px_rgba(29,185,84,0.4)]"
      >
        <SpotifyLogo />
        Authorize with Spotify
      </button>

      <p className="text-white/50 text-sm text-center leading-relaxed mt-2">
        Step 2: Paste the code from the callback page
      </p>
      <div className="flex gap-2 w-full">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") void submitCode(); }}
          placeholder="Paste authorization code..."
          className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-mono placeholder:text-white/20 focus:outline-none focus:border-[#1DB954]/50"
        />
        <button
          onClick={() => void submitCode()}
          disabled={isLoading || !code.trim()}
          className="px-6 py-2.5 rounded-lg bg-[#1DB954] hover:bg-[#1ed760] disabled:opacity-40 disabled:cursor-not-allowed text-black text-sm font-bold transition-colors"
        >
          {isLoading ? "..." : "Connect"}
        </button>
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

export function SpotifyConnectPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useSpotifyStore();

  return (
    <div className="screen-container gap-6 px-6">
      <button
        onClick={() => void navigate("/mode")}
        className="absolute top-4 left-4 flex items-center gap-1.5 text-white/40 hover:text-white/80 transition-colors text-sm"
      >
        <ArrowLeft size={16} />
        <span className="tracking-wide">Back</span>
      </button>

      {/* Spotify logo */}
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[#1DB954]/15 border border-[#1DB954]/30 shadow-[0_0_32px_rgba(29,185,84,0.25)]">
        <svg viewBox="0 0 24 24" className="w-10 h-10 text-[#1DB954]" fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
      </div>

      <div className="text-center">
        <NeonText as="h2" color="cyan" className="text-[clamp(1.5rem,4vw,2.8rem)] mb-3">
          CONNECT SPOTIFY
        </NeonText>
        <p className="text-white/50 text-sm max-w-xs leading-relaxed">
          Curated mode uses Spotify to stream songs. Connect your account to pick your song and
          start singing.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <p className="text-[10px] uppercase tracking-widest text-white/25">
          Spotify Premium required
        </p>

        {USE_CODE_PASTE_FLOW ? (
          <CodePasteFlow />
        ) : (
          <button
            onClick={() => void login()}
            disabled={isLoading}
            className="flex items-center gap-3 px-8 py-3.5 rounded-full bg-[#1DB954] hover:bg-[#1ed760] disabled:opacity-60 disabled:cursor-not-allowed text-black text-base font-bold transition-all duration-200 hover:scale-105 shadow-[0_0_24px_rgba(29,185,84,0.4)]"
          >
            {isLoading ? (
              <span className="animate-pulse">Connecting...</span>
            ) : (
              <>
                <SpotifyLogo />
                Connect with Spotify
              </>
            )}
          </button>
        )}

        <Button variant="outline" size="sm" className="mt-1" onClick={() => void navigate("/mode")}>
          Switch to Freeform Mode
        </Button>
      </div>
    </div>
  );
}
