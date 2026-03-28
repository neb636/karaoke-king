import songDataRaw from "@/data/song-data.json";
import type { DataFormat } from "@/types/songs";

const SONG_DATA = songDataRaw as Record<string, { extractedData: DataFormat | null }>;

export function getSongExtractedData(songId: string): DataFormat | null {
  return SONG_DATA[songId]?.extractedData ?? null;
}

/**
 * Converts a UltraStar beat number to absolute track position in milliseconds.
 * The result is directly comparable to Spotify's currentPositionMs.
 */
export function beatToMs(beat: number, bpm: number, gapMs: number): number {
  return gapMs + (beat * 15000) / bpm;
}

/** Returns the set of expected pitch classes (mod 12) from a song's note data. */
export function getExpectedPitchClasses(data: DataFormat): Set<number> {
  const classes = new Set<number>();
  for (const track of data.tracks) {
    // Skip P2 (duet backing track) — score against lead vocal only
    if (track.player === "P2") continue;
    for (const line of track.lines) {
      for (const note of line.notes) {
        if (note.type !== "rap" && note.type !== "freestyle") {
          classes.add(((note.pitch % 12) + 12) % 12);
        }
      }
    }
  }
  return classes;
}
