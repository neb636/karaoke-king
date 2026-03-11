import { create } from "zustand";
import type { PlayMode, RegionId, CuratedSong } from "@/types/songs";
import { SONG_CATALOG } from "@/data/songs/catalog";
import { REGION_SONGS } from "@/data/songs/regions";
import { detectRegion } from "@/lib/regionDetection";

interface SongState {
  playMode: PlayMode;
  selectedRegion: RegionId;
  selectedSongId: string | null;

  setPlayMode: (mode: PlayMode) => void;
  setRegion: (region: RegionId) => void;
  selectSong: (songId: string | null) => void;
  getCurrentSong: () => CuratedSong | null;
  getRegionSongs: () => CuratedSong[];
}

export const useSongStore = create<SongState>((set, get) => ({
  playMode: "curated",
  selectedRegion: detectRegion(),
  selectedSongId: null,

  setPlayMode: (mode) => set({ playMode: mode }),
  setRegion: (region) => set({ selectedRegion: region, selectedSongId: null }),
  selectSong: (songId) => set({ selectedSongId: songId }),

  getCurrentSong: () => {
    const { selectedSongId } = get();
    if (!selectedSongId) return null;
    return SONG_CATALOG[selectedSongId] ?? null;
  },

  getRegionSongs: () => {
    const { selectedRegion } = get();
    const songIds = REGION_SONGS[selectedRegion] ?? [];
    return songIds
      .map((id) => SONG_CATALOG[id])
      .filter((s): s is CuratedSong => !!s);
  },
}));
