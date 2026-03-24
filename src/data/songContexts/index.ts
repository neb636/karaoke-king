import type { SongContext } from "@/types/songContext";

/**
 * Lazy-load map for song contexts.
 *
 * Songs that don't yet have a context file are intentionally omitted — the
 * consumer should treat a null result as "no context available" and fall back
 * to generic freeform scoring.
 *
 * Add new entries here as context files are authored.
 */
const CONTEXT_LOADERS: Record<string, () => Promise<{ default: SongContext }>> = {
  "dont-stop-believin":  () => import("./dont-stop-believin"),
  "bohemian-rhapsody":   () => import("./bohemian-rhapsody"),
  "sweet-caroline":      () => import("./sweet-caroline"),
  "dancing-queen":       () => import("./dancing-queen"),
  "livin-on-a-prayer":   () => import("./livin-on-a-prayer"),
  "i-will-survive":      () => import("./i-will-survive"),
  "mr-brightside":       () => import("./mr-brightside"),
  "uptown-funk":         () => import("./uptown-funk"),
  "rolling-in-the-deep": () => import("./rolling-in-the-deep"),
  "dynamite":            () => import("./dynamite"),
};

/**
 * Returns the IDs of all songs that have a context file.
 * Useful for UI indicators (e.g. showing a "scoring" badge on song cards).
 */
export const SONGS_WITH_CONTEXT = new Set(Object.keys(CONTEXT_LOADERS));

/**
 * Asynchronously loads the SongContext for the given song ID.
 * Returns null if no context file exists for that song yet.
 */
export async function loadSongContext(songId: string): Promise<SongContext | null> {
  const loader = CONTEXT_LOADERS[songId];
  if (!loader) return null;
  try {
    const mod = await loader();
    return mod.default;
  } catch (err) {
    console.warn(`[SongContext] Failed to load context for "${songId}":`, err);
    return null;
  }
}
