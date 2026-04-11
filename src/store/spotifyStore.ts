import { create } from "zustand";
import {
  buildAuthUrl,
  exchangeCodeForToken,
  getStoredToken,
  clearToken,
} from "@/services/spotify/auth";
import { USE_CODE_PASTE_FLOW } from "@/services/spotify/constants";
import { getCurrentUser, type SpotifyUser } from "@/services/spotify/api";
import { initSpotifySDK } from "@/services/spotify/sdk";

interface SpotifyState {
  isAuthenticated: boolean;
  isPremium: boolean;
  user: SpotifyUser | null;
  error: string | null;
  isLoading: boolean;

  login: () => Promise<void>;
  logout: () => void;
  handleCallback: (code: string) => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useSpotifyStore = create<SpotifyState>((set) => ({
  isAuthenticated: false,
  isPremium: false,
  user: null,
  error: null,
  isLoading: false,

  login: async () => {
    try {
      const url = await buildAuthUrl();
      if (USE_CODE_PASTE_FLOW) {
        window.open(url, "_blank");
      } else {
        window.location.href = url;
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Failed to start login" });
    }
  },

  logout: () => {
    clearToken();
    set({ isAuthenticated: false, isPremium: false, user: null, error: null });
  },

  handleCallback: async (code: string) => {
    set({ isLoading: true, error: null });
    try {
      await exchangeCodeForToken(code);
      const user = await getCurrentUser();
      const isPremium = user.product === "premium";
      set({ isAuthenticated: true, isPremium, user, isLoading: false });
      if (isPremium) initSpotifySDK();
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Auth failed",
        isLoading: false,
      });
    }
  },

  checkAuth: async () => {
    const token = getStoredToken();
    if (!token) return;

    // Token exists but may be expired
    if (Date.now() > token.expires_at) {
      // Will try to refresh in getCurrentUser via the api wrapper
    }

    set({ isLoading: true });
    try {
      const user = await getCurrentUser();
      const isPremium = user.product === "premium";
      set({ isAuthenticated: true, isPremium, user, isLoading: false });
      if (isPremium) initSpotifySDK();
    } catch {
      clearToken();
      set({ isAuthenticated: false, isPremium: false, user: null, isLoading: false });
    }
  },
}));
