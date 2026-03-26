import { create } from "zustand";
import type { PlayMode, RegionId, CuratedSong } from "@/types/songs";
import { SONG_CATALOG } from "@/data/songs/catalog";
import { REGION_SONGS, REGION_IDS } from "@/data/songs/regions";

interface SongState {
  playMode: PlayMode;
  selectedRegions: RegionId[];
  selectedSongId: string | null;
  playerSongIds: Record<number, string>;

  setPlayMode: (mode: PlayMode) => void;
  toggleRegion: (region: RegionId) => void;
  selectSong: (songId: string | null) => void;
  selectSongForPlayer: (playerIndex: number, songId: string) => void;
  clearPlayerSongs: () => void;
  getCurrentSong: () => CuratedSong | null;
  getPlayerSong: (playerIndex: number) => CuratedSong | null;
  getRegionSongs: () => CuratedSong[];
}

export const useSongStore = create<SongState>((set, get) => ({
  playMode: "curated",
  selectedRegions: [],
  selectedSongId: null,
  playerSongIds: {},

  setPlayMode: (mode) => set({ playMode: mode }),

  toggleRegion: (region) =>
    set((s) => {
      const next = s.selectedRegions.includes(region)
        ? s.selectedRegions.filter((id) => id !== region)
        : [...s.selectedRegions, region];
      return { selectedRegions: next, selectedSongId: null };
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

  getRegionSongs: () => {
    const { selectedRegions } = get();
    const regions = selectedRegions.length > 0 ? selectedRegions : REGION_IDS;
    const seen = new Set<string>();
    const songs: CuratedSong[] = [];
    for (const regionId of regions) {
      for (const id of REGION_SONGS[regionId] ?? []) {
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
