import type { CuratedSong } from "@/types/songs";
import catalogData from "./catalog.json";

/**
 * Master catalog of curated songs keyed by slug ID.
 * Cross-category songs share the same entry -- categories reference by ID.
 */
export const SONG_CATALOG: Record<string, CuratedSong> = catalogData as Record<string, CuratedSong>;
