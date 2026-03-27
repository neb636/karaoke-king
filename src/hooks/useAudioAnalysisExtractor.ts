import { useEffect, useRef, useState } from "react";
import { SONG_CATALOG } from "@/data/songs/catalog";
import { getAudioAnalysis, getAudioFeatures } from "@/services/spotify/api";

// Shape we keep per song in the final JSON
export interface SongAnalysisEntry {
  id: string;
  trackId: string;
  features: {
    key: number;
    mode: number;
    tempo: number;
    time_signature: number;
    loudness: number;
    energy: number;
    danceability: number;
    valence: number;
    acousticness: number;
    speechiness: number;
    duration_ms: number;
  };
  track: {
    key: number;
    mode: number;
    tempo: number;
    time_signature: number;
    loudness: number;
    duration: number;
  };
  sections: {
    start: number;
    duration: number;
    loudness: number;
    tempo: number;
    key: number;
    mode: number;
    confidence: number;
  }[];
  // segments trimmed to just start + pitches (chroma), duration dropped to save size
  segments: {
    start: number;
    pitches: number[];
  }[];
}

export type ExtractorStatus = "idle" | "running" | "done" | "error";

// Module-level singleton so the extraction survives page navigation
let singleton: {
  status: ExtractorStatus;
  done: number;
  total: number;
  results: Record<string, SongAnalysisEntry>;
  error: string | null;
} | null = null;

const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((fn) => fn());
}

async function runExtraction() {
  if (singleton && singleton.status !== "idle") return;

  const songs = Object.values(SONG_CATALOG);
  singleton = { status: "running", done: 0, total: songs.length, results: {}, error: null };
  notify();

  for (const song of songs) {
    const trackId = song.spotifyUri.split(":")[2];
    try {
      const [features, analysis] = await Promise.all([
        getAudioFeatures(trackId),
        getAudioAnalysis(trackId),
      ]);

      const entry: SongAnalysisEntry = {
        id: song.id,
        trackId,
        features: {
          key: features.key,
          mode: features.mode,
          tempo: features.tempo,
          time_signature: features.time_signature,
          loudness: features.loudness,
          energy: features.energy,
          danceability: features.danceability,
          valence: features.valence,
          acousticness: features.acousticness,
          speechiness: features.speechiness,
          duration_ms: features.duration_ms,
        },
        track: analysis.track,
        sections: analysis.sections.map((s) => ({
          start: s.start,
          duration: s.duration,
          loudness: s.loudness,
          tempo: s.tempo,
          key: s.key,
          mode: s.mode,
          confidence: s.confidence,
        })),
        segments: analysis.segments.map((s) => ({
          start: s.start,
          pitches: s.pitches,
        })),
      };

      singleton.results[song.id] = entry;
    } catch (err) {
      // Log but keep going — partial results are still useful
      console.warn(`[extractor] failed ${song.id}:`, err);
    }

    singleton.done++;
    notify();

    // Stagger to avoid Spotify rate limits (~1 req/500ms is safe)
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  singleton.status = "done";
  notify();
}

export function useAudioAnalysisExtractor(isAuthenticated: boolean) {
  const [, rerender] = useState(0);
  const startedRef = useRef(false);

  // Subscribe to singleton updates
  useEffect(() => {
    const handler = () => rerender((n) => n + 1);
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  // Kick off once when authenticated
  useEffect(() => {
    if (!isAuthenticated || startedRef.current) return;
    if (singleton && singleton.status !== "idle") return;
    startedRef.current = true;
    void runExtraction();
  }, [isAuthenticated]);

  const state = singleton ?? { status: "idle" as ExtractorStatus, done: 0, total: Object.keys(SONG_CATALOG).length, results: {}, error: null };

  function downloadResults() {
    if (!singleton || singleton.status !== "done") return;
    const blob = new Blob([JSON.stringify(singleton.results, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "song-analysis.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return {
    status: state.status,
    done: state.done,
    total: state.total,
    downloadResults,
  };
}
