import { create } from "zustand";

interface SettingsState {
  coachingEnabled: boolean;
  toggleCoaching: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  coachingEnabled: true,
  toggleCoaching: () => set((s) => ({ coachingEnabled: !s.coachingEnabled })),
}));
