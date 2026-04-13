// ── Player ──────────────────────────────────────────────────────────────────

export interface Player {
  name: string;
  bumpers: boolean;
}

// ── Game Modes ───────────────────────────────────────────────────────────────

export type GameModeKey = "quick" | "tournament3" | "tournament5" | "tournament10";

export interface GameModeConfig {
  label: string;
  rounds: number;
  icon: string;
  description: string;
}

// ── Scoring ──────────────────────────────────────────────────────────────────

export interface PlayerScore {
  total: number;
  energy: number;
  pitch: number;
  sustain: number;
  duration: number;
  time: number;
  bumpers: boolean;
  /** Per-note accuracy percentage (0-100), only for curated songs */
  noteAccuracy?: number;
  /** Best consecutive note streak */
  bestStreak?: number;
  /** Golden notes hit / total */
  goldenHits?: number;
  goldenTotal?: number;
  /** Grade distribution */
  perfects?: number;
  goods?: number;
  oks?: number;
  noteMisses?: number;
}

export interface RankedPlayer {
  name: string;
  index: number;
  score: PlayerScore;
}

// ── Scoring Mode ─────────────────────────────────────────────────────────────

export type ScoringMode = "fun" | "expert";

// ── Re-export song types ────────────────────────────────────────────────────

export type {
  SongDifficulty,
  PlayMode,
  CategoryId,
  Category,
  CoachingCueType,
  CoachingCue,
  CuratedSong,
} from "./songs";
