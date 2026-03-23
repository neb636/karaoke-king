import { useState, useEffect, useRef } from "react";
import { getTracksByUris } from "@/services/spotify/api";
import type { CuratedSong } from "@/types/songs";

/** Map of spotifyUri → smallest usable album art URL (≥ 64px) */
export type ThumbnailMap = Map<string, string>;

const moduleCache = new Map<string, string>();

/**
 * Fetches Spotify album art thumbnails for a list of curated songs.
 * Results are cached in module scope so re-renders and page revisits are free.
 * Only fires when the user is authenticated (Spotify token available).
 */
export function useSpotifyThumbnails(
  songs: CuratedSong[],
  isAuthenticated: boolean,
): ThumbnailMap {
  const [thumbnails, setThumbnails] = useState<ThumbnailMap>(new Map(moduleCache));
  const fetchedUris = useRef(new Set<string>());

  useEffect(() => {
    if (!isAuthenticated || songs.length === 0) return;

    const uncached = songs
      .map((s) => s.spotifyUri)
      .filter((uri) => !moduleCache.has(uri) && !fetchedUris.current.has(uri));

    if (uncached.length === 0) return;

    uncached.forEach((uri) => fetchedUris.current.add(uri));

    void getTracksByUris(uncached).then((trackMap) => {
      let changed = false;
      for (const [uri, track] of trackMap) {
        if (moduleCache.has(uri)) continue;
        // Prefer the smallest image that's at least 64px wide (usually 300px)
        const images = [...track.album.images].sort((a, b) => a.width - b.width);
        const img = images.find((i) => i.width >= 64) ?? images[0];
        if (img) {
          moduleCache.set(uri, img.url);
          changed = true;
        }
      }
      if (changed) {
        setThumbnails(new Map(moduleCache));
      }
    });
  }, [songs, isAuthenticated]);

  return thumbnails;
}
