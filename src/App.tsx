import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { TitlePage } from "@/pages/TitlePage";
import { PlayerSetupPage } from "@/pages/PlayerSetupPage";
import { ModeSelectPage } from "@/pages/ModeSelectPage";
import { SingPage } from "@/pages/SingPage";
import { ResultsPage } from "@/pages/ResultsPage";

export function App() {
  return (
    <BrowserRouter>
      <div className="relative w-screen h-screen overflow-hidden bg-game flex items-center justify-center">
        <Routes>
          <Route path="/" element={<TitlePage />} />
          <Route path="/players" element={<PlayerSetupPage />} />
          <Route path="/mode" element={<ModeSelectPage />} />
          <Route path="/sing" element={<SingPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
