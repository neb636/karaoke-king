import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { TitlePage } from "@/pages/TitlePage";
import { PlayerSetupPage } from "@/pages/PlayerSetupPage";
import { ModeSelectPage } from "@/pages/ModeSelectPage";
import { SongSelectPage } from "@/pages/SongSelectPage";
import { SpotifyConnectPage } from "@/pages/SpotifyConnectPage";
import { SingPageV2 as SingPage } from "@/pages/SingPageV2";
import { ResultsPage } from "@/pages/ResultsPage";
import { SpotifyCallbackPage } from "@/pages/SpotifyCallbackPage";
import { RequireSpotify } from "@/components/spotify/RequireSpotify";
import { useSpotifyStore } from "@/store/spotifyStore";

export function App() {
  const checkAuth = useSpotifyStore((s) => s.checkAuth);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter basename="/karaoke-king">
      <div className="relative w-screen h-screen overflow-hidden bg-game flex items-stretch justify-center">
        <Routes>
          <Route path="/" element={<TitlePage />} />
          <Route path="/players" element={<PlayerSetupPage />} />
          <Route path="/mode" element={<ModeSelectPage />} />
          <Route path="/spotify-connect" element={<SpotifyConnectPage />} />
          <Route
            path="/songs"
            element={
              <RequireSpotify>
                <SongSelectPage />
              </RequireSpotify>
            }
          />
          <Route path="/sing" element={<SingPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/spotify-callback" element={<SpotifyCallbackPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
