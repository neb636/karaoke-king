import { create } from "zustand";
import type { PlayMode, RegionId, CuratedSong } from "@/types/songs";
import { SONG_CATALOG } from "@/data/songs/catalog";
import { REGION_SONGS } from "@/data/songs/regions";
import { detectRegion } from "@/lib/regionDetection";

interface SongState {
  playMode: PlayMode;
  selectedRegion: RegionId;
  selectedSongId: string | null;
  playerSongIds: Record<number, string>;
  pickingPlayer: number;

  setPlayMode: (mode: PlayMode) => void;
  setRegion: (region: RegionId) => void;
  selectSong: (songId: string | null) => void;
  selectSongForPlayer: (playerIndex: number, songId: string) => void;
  setPickingPlayer: (playerIndex: number) => void;
  clearPlayerSongs: () => void;
  getCurrentSong: () => CuratedSong | null;
  getPlayerSong: (playerIndex: number) => CuratedSong | null;
  getRegionSongs: () => CuratedSong[];
}

export const useSongStore = create<SongState>((set, get) => ({
  playMode: "curated",
  selectedRegion: detectRegion(),
  selectedSongId: null,
  playerSongIds: {},
  pickingPlayer: 0,

  setPlayMode: (mode) => set({ playMode: mode }),
  setRegion: (region) => set({ selectedRegion: region, selectedSongId: null }),
  selectSong: (songId) => set({ selectedSongId: songId }),

  selectSongForPlayer: (playerIndex, songId) =>
    set((s) => ({
      playerSongIds: { ...s.playerSongIds, [playerIndex]: songId },
    })),

  setPickingPlayer: (playerIndex) =>
    set({ pickingPlayer: playerIndex, selectedSongId: null }),

  clearPlayerSongs: () => set({ playerSongIds: {}, pickingPlayer: 0 }),

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
    const { selectedRegion } = get();
    const songIds = REGION_SONGS[selectedRegion] ?? [];
    return songIds
      .map((id) => SONG_CATALOG[id])
      .filter((s): s is CuratedSong => !!s);
  },
}));
