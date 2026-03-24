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
}

export interface RankedPlayer {
  name: string;
  index: number;
  score: PlayerScore;
}

// ── Feedback ─────────────────────────────────────────────────────────────────

export type FeedbackLevel = "quiet" | "medium" | "loud";

// ── App Screens (used by React Router routes) ─────────────────────────────────

export type AppRoute = "/" | "/players" | "/mode" | "/songs" | "/sing" | "/results" | "/spotify-callback";

// ── Re-export song types ────────────────────────────────────────────────────

export type {
  SongDifficulty,
  PlayMode,
  RegionId,
  Region,
  CoachingCueType,
  CoachingCue,
  CuratedSong,
} from "./songs";

// ── Re-export song context types ─────────────────────────────────────────────

export type {
  SectionType,
  SingingIntensity,
  SongSection,
  PitchPoint,
  PitchPhrase,
  SongMeta,
  SongContext,
} from "./songContext";

export { getSectionAt, getExpectedPitchAt, getExpectedSemitoneAt } from "./songContext";
