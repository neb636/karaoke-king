import type { CoachingCue } from "./songs";

// ── Section Types ─────────────────────────────────────────────────────────────

export type SectionType =
  | "intro"
  | "verse"
  | "pre-chorus"
  | "chorus"
  | "bridge"
  | "outro"
  | "instrumental"
  | "ad-lib"
  | "harmony";

export type SingingIntensity = "soft" | "medium" | "loud" | "belt";

export interface SongSection {
  type: SectionType;
  startMs: number;
  endMs: number;
  /** Human-readable label, e.g. "Verse 1", "Final Chorus" */
  label?: string;
  /** True = the user should be actively singing here */
  isSinging: boolean;
  /**
   * Expected vocal intensity for this section. Drives "sing louder" prompts
   * and the automatic coaching overlay.
   */
  intensity: SingingIntensity;
}

// ── Pitch Reference ───────────────────────────────────────────────────────────

export interface PitchPoint {
  /** Position in the song in milliseconds */
  timeMs: number;
  /** Fundamental frequency in Hz. Use -1 to indicate a rest/silence. */
  frequency: number;
  /** How long this note is held in milliseconds */
  durationMs: number;
  /**
   * MIDI semitone offset relative to A4 (440 Hz = semitone 0 here).
   * Computed as Math.round(12 * Math.log2(frequency / 440)).
   * -1 when frequency is -1.
   */
  semitone: number;
  /**
   * Optional lyric syllable being sung on this note.
   * Populated now for scoring context; enables future synchronized lyrics.
   */
  syllable?: string;
}

export interface PitchPhrase {
  startMs: number;
  endMs: number;
  /** Ordered list of notes within this phrase */
  notes: PitchPoint[];
}

// ── Song Metadata ─────────────────────────────────────────────────────────────

export interface SongMeta {
  bpm: number;
  /** e.g. "C major", "A minor", "F# minor" */
  keySignature: string;
  /** e.g. "4/4", "3/4", "6/8" */
  timeSignature: string;
  /** Lowest note the singer is expected to hit, in Hz */
  vocalRangeLowHz: number;
  /** Highest note the singer is expected to hit, in Hz */
  vocalRangeHighHz: number;
}

// ── Full Song Context ─────────────────────────────────────────────────────────

export interface SongContext {
  /** Matches CuratedSong.id */
  songId: string;
  /**
   * Increment when this data file is updated so consumers can detect stale
   * cached data and re-load.
   */
  version: number;
  meta: SongMeta;
  /** Ordered structural sections covering the full song duration */
  sections: SongSection[];
  /**
   * Reference pitch phrases for vocal sections only.
   * Used to score pitch accuracy (hit the right note at the right time)
   * rather than mere pitch variety.
   */
  pitchPhrases: PitchPhrase[];
  /**
   * Timestamped coaching cues. Replaces the legacy COACHING_DATA entries —
   * keeping them co-located with the rest of the song context.
   */
  coachingCues: CoachingCue[];
}

// ── Helper ────────────────────────────────────────────────────────────────────

/**
 * Returns the SongSection active at the given playback position,
 * or null if the position falls outside any defined section.
 */
export function getSectionAt(
  sections: SongSection[],
  positionMs: number,
): SongSection | null {
  for (const section of sections) {
    if (positionMs >= section.startMs && positionMs < section.endMs) {
      return section;
    }
  }
  return null;
}

/**
 * Returns the expected pitch (in Hz) for the given playback position
 * by scanning pitchPhrases. Returns -1 if no note is active at that time.
 */
export function getExpectedPitchAt(
  pitchPhrases: PitchPhrase[],
  positionMs: number,
): number {
  for (const phrase of pitchPhrases) {
    if (positionMs < phrase.startMs || positionMs >= phrase.endMs) continue;
    for (const note of phrase.notes) {
      if (
        positionMs >= note.timeMs &&
        positionMs < note.timeMs + note.durationMs
      ) {
        return note.frequency;
      }
    }
  }
  return -1;
}

/**
 * Returns the expected semitone for the given playback position,
 * or -1 if no note is active.
 */
export function getExpectedSemitoneAt(
  pitchPhrases: PitchPhrase[],
  positionMs: number,
): number {
  for (const phrase of pitchPhrases) {
    if (positionMs < phrase.startMs || positionMs >= phrase.endMs) continue;
    for (const note of phrase.notes) {
      if (
        positionMs >= note.timeMs &&
        positionMs < note.timeMs + note.durationMs
      ) {
        return note.semitone;
      }
    }
  }
  return -1;
}
