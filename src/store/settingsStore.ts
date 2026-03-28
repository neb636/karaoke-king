import { create } from "zustand";
import type { ScoringMode } from "@/lib/constants";

interface SettingsState {
  coachingEnabled: boolean;
  toggleCoaching: () => void;
  scoringMode: ScoringMode;
  setScoringMode: (mode: ScoringMode) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  coachingEnabled: true,
  toggleCoaching: () => set((s) => ({ coachingEnabled: !s.coachingEnabled })),
  scoringMode: "fun",
  setScoringMode: (mode) => set({ scoringMode: mode }),
}));
