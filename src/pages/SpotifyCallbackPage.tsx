import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { NeonText } from "@/components/NeonText";
import { useSpotifyStore } from "@/store/spotifyStore";

export function SpotifyCallbackPage() {
  const navigate = useNavigate();
  const { handleCallback, error } = useSpotifyStore();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const authError = params.get("error");

    if (authError) {
      void navigate("/songs");
      return;
    }

    if (code) {
      handleCallback(code).then(() => {
        void navigate("/songs");
      });
    } else {
      void navigate("/songs");
    }
  }, [handleCallback, navigate]);

  return (
    <div className="screen-container">
      {error ? (
        <NeonText as="h2" color="pink" className="text-xl">
          {error}
        </NeonText>
      ) : (
        <NeonText as="h2" color="cyan" className="text-xl animate-pulse">
          Connecting to Spotify...
        </NeonText>
      )}
    </div>
  );
}
