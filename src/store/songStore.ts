import { create } from "zustand";
import type { PlayMode, CategoryId, CuratedSong } from "@/types/songs";
import { SONG_CATALOG } from "@/data/songs/catalog";
import { CATEGORY_SONGS, CATEGORY_IDS } from "@/data/songs/categories";

interface SongState {
  playMode: PlayMode;
  selectedCategories: CategoryId[];
  selectedSongId: string | null;
  playerSongIds: Record<number, string>;

  setPlayMode: (mode: PlayMode) => void;
  toggleCategory: (category: CategoryId) => void;
  selectSong: (songId: string | null) => void;
  selectSongForPlayer: (playerIndex: number, songId: string) => void;
  clearPlayerSongs: () => void;
  getCurrentSong: () => CuratedSong | null;
  getPlayerSong: (playerIndex: number) => CuratedSong | null;
  getCategorySongs: () => CuratedSong[];
}

export const useSongStore = create<SongState>((set, get) => ({
  playMode: "curated",
  selectedCategories: [],
  selectedSongId: null,
  playerSongIds: {},

  setPlayMode: (mode) => set({ playMode: mode }),

  toggleCategory: (category) =>
    set((s) => {
      const next = s.selectedCategories.includes(category)
        ? s.selectedCategories.filter((id) => id !== category)
        : [...s.selectedCategories, category];
      return { selectedCategories: next, selectedSongId: null };
    }),

  selectSong: (songId) => set({ selectedSongId: songId }),

  selectSongForPlayer: (playerIndex, songId) =>
    set((s) => ({
      playerSongIds: { ...s.playerSongIds, [playerIndex]: songId },
    })),

  clearPlayerSongs: () => set({ playerSongIds: {}, selectedSongId: null }),

  getCurrentSong: () => {
    const { selectedSongId } = get();
    if (!selectedSongId) return null;
    return SONG_CATALOG[selectedSongId] ?? null;
  },

  getPlayerSong: (playerIndex) => {
    const { playerSongIds } = get();
    const songId = playerSongIds[playerIndex];
    if (!songId) return null;
    return SONG_CATALOG[songId] ?? null;
  },

  getCategorySongs: () => {
    const { selectedCategories } = get();
    const categories = selectedCategories.length > 0 ? selectedCategories : CATEGORY_IDS;
    const seen = new Set<string>();
    const songs: CuratedSong[] = [];
    for (const categoryId of categories) {
      for (const id of CATEGORY_SONGS[categoryId] ?? []) {
        if (!seen.has(id)) {
          seen.add(id);
          const song = SONG_CATALOG[id];
          if (song) songs.push(song);
        }
      }
    }
    return songs;
  },
}));
