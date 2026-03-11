import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { TitlePage } from "@/pages/TitlePage";
import { PlayerSetupPage } from "@/pages/PlayerSetupPage";
import { ModeSelectPage } from "@/pages/ModeSelectPage";
import { SongSelectPage } from "@/pages/SongSelectPage";
import { SingPage } from "@/pages/SingPage";
import { ResultsPage } from "@/pages/ResultsPage";
import { SpotifyCallbackPage } from "@/pages/SpotifyCallbackPage";
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
          <Route path="/songs" element={<SongSelectPage />} />
          <Route path="/sing" element={<SingPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/spotify-callback" element={<SpotifyCallbackPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
