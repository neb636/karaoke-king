import type { DataFormat, Note, NoteType } from "@/types/songs";
import type { ScoringMode } from "@/types";
import { NOISE_FLOOR } from "@/lib/constants";
import { beatToMs } from "@/data/songs/songData";

// ── Note grade types ─────────────────────────────────────────────────────────

export type NoteGrade = "perfect" | "good" | "ok" | "miss";

export interface StreakTier {
  label: string;
  multiplier: number;
  minStreak: number;
}

export const STREAK_TIERS: StreakTier[] = [
  { label: "LEGENDARY", multiplier: 1.5, minStreak: 30 },
  { label: "UNSTOPPABLE", multiplier: 1.3, minStreak: 20 },
  { label: "ON FIRE", multiplier: 1.2, minStreak: 10 },
  { label: "WARMING UP", multiplier: 1.1, minStreak: 5 },
];

export function getStreakTier(streak: number): StreakTier | null {
  for (const tier of STREAK_TIERS) {
    if (streak >= tier.minStreak) return tier;
  }
  return null;
}

// ── Pre-computed note window for fast lookup ─────────────────────────────────

export interface NoteWindow {
  note: Note;
  startMs: number;
  endMs: number;
  /** Weight: golden = 2, normal = 1, rap/freestyle = 0.5 */
  weight: number;
}

export function buildNoteWindows(data: DataFormat): NoteWindow[] {
  const { bpm, gapMs, tracks, isDuet } = data;
  const track = isDuet ? tracks.find((t) => t.player === "P1") : tracks[0];
  if (!track) return [];

  const windows: NoteWindow[] = [];
  for (const line of track.lines) {
    for (const note of line.notes) {
      const startMs = beatToMs(note.beat, bpm, gapMs);
      const endMs = beatToMs(note.beat + note.duration, bpm, gapMs);
      const weight = noteWeight(note.type);
      windows.push({ note, startMs, endMs, weight });
    }
  }
  return windows;
}

export function noteWeight(type: NoteType): number {
  if (type === "golden") return 2;
  if (type === "rap" || type === "freestyle") return 0.5;
  return 1;
}

// ── Pitch comparison ─────────────────────────────────────────────────────────

export function hzToMidi(hz: number): number {
  return 69 + 12 * Math.log2(hz / 440);
}

/** Semitone distance between two pitches, octave-agnostic (0-6 range) */
export function pitchClassDistance(midiA: number, midiB: number): number {
  const classA = ((Math.round(midiA) % 12) + 12) % 12;
  const classB = ((Math.round(midiB) % 12) + 12) % 12;
  const diff = Math.abs(classA - classB);
  return Math.min(diff, 12 - diff);
}

export function gradeNote(
  detectedHz: number,
  rms: number,
  note: Note,
  mode: ScoringMode
): NoteGrade {
  if (note.type === "rap" || note.type === "freestyle") {
    return rms > NOISE_FLOOR ? "good" : "miss";
  }

  if (detectedHz <= 0 || rms < NOISE_FLOOR) return "miss";

  const detectedMidi = hzToMidi(detectedHz);
  const dist = pitchClassDistance(detectedMidi, note.pitch);

  if (mode === "expert") {
    if (dist <= 1) return "perfect";
    if (dist <= 2) return "good";
    return "miss";
  }

  // Fun mode: wider tolerance, energy boost
  if (dist <= 1) return "perfect";
  if (dist <= 2) return "good";
  if (dist <= 4) return "ok";
  // In fun mode, singing loud on any pitch counts as OK
  if (rms > 0.06) return "ok";
  return "miss";
}

export function bestGrade(samples: NoteGrade[]): NoteGrade {
  if (samples.length === 0) return "miss";
  const order: NoteGrade[] = ["perfect", "good", "ok", "miss"];
  for (const g of order) {
    // Consider a grade achieved if >= 30% of samples hit it or better
    const count = samples.filter((s) => gradeRank(s) <= gradeRank(g)).length;
    if (count / samples.length >= 0.3) return g;
  }
  return "miss";
}

export function gradeRank(g: NoteGrade): number {
  switch (g) {
    case "perfect":
      return 0;
    case "good":
      return 1;
    case "ok":
      return 2;
    case "miss":
      return 3;
  }
}
