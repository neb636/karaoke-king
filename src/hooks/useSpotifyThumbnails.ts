import { useState, useEffect, useRef } from "react";
import { getTracksByUris } from "@/services/spotify/api";
import type { CuratedSong } from "@/types/songs";

/** Map of spotifyUri → largest available album art URL */
export type ThumbnailMap = Map<string, string>;

/** Set of spotifyUris that are not playable in the user's market */
export type UnavailableSet = Set<string>;

const thumbnailCache = new Map<string, string>();
const unavailableCache = new Set<string>();
const fetchedUrisGlobal = new Set<string>();

/**
 * Fetches Spotify album art thumbnails for a list of curated songs, and
 * detects which songs are not playable in the user's market via is_playable.
 * Results are cached in module scope so re-renders and page revisits are free.
 * Only fires when the user is authenticated (Spotify token available).
 */
export function useSpotifyThumbnails(
  songs: CuratedSong[],
  isAuthenticated: boolean,
): { thumbnails: ThumbnailMap; unavailable: UnavailableSet } {
  const [thumbnails, setThumbnails] = useState<ThumbnailMap>(new Map(thumbnailCache));
  const [unavailable, setUnavailable] = useState<UnavailableSet>(new Set(unavailableCache));
  const fetchedUris = useRef(new Set<string>());

  useEffect(() => {
    if (!isAuthenticated || songs.length === 0) return;

    const uncached = songs
      .map((s) => s.spotifyUri)
      .filter((uri) => !fetchedUrisGlobal.has(uri) && !fetchedUris.current.has(uri));

    if (uncached.length === 0) return;

    uncached.forEach((uri) => {
      fetchedUris.current.add(uri);
      fetchedUrisGlobal.add(uri);
    });

    void getTracksByUris(uncached).then((trackMap) => {
      let thumbnailChanged = false;
      let unavailableChanged = false;

      for (const uri of uncached) {
        const track = trackMap.get(uri);
        if (!track) {
          // Track not returned at all — treat as unavailable
          if (!unavailableCache.has(uri)) {
            unavailableCache.add(uri);
            unavailableChanged = true;
          }
          continue;
        }

        // is_playable is false when the track is restricted in the user's market
        if (track.is_playable === false) {
          if (!unavailableCache.has(uri)) {
            unavailableCache.add(uri);
            unavailableChanged = true;
          }
        }

        if (!thumbnailCache.has(uri)) {
          // Prefer 300px image — good quality without the 640px bandwidth cost
          const images = [...track.album.images].sort((a, b) => a.width - b.width);
          const img = images.find((i) => i.width >= 300) ?? images[images.length - 1];
          if (img) {
            thumbnailCache.set(uri, img.url);
            thumbnailChanged = true;
          }
        }
      }

      if (thumbnailChanged) setThumbnails(new Map(thumbnailCache));
      if (unavailableChanged) setUnavailable(new Set(unavailableCache));
    });
  }, [songs, isAuthenticated]);

  return { thumbnails, unavailable };
}
