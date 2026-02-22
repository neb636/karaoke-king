// ── Player ──────────────────────────────────────────────────────────────────

export interface PlayerColor {
  name: string; // CSS class suffix, e.g. "neon-pink"
  hex: string;
}

export interface Player {
  name: string;
  bumpers: boolean;
  color: PlayerColor;
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
  color: PlayerColor;
}

// ── Feedback ─────────────────────────────────────────────────────────────────

export type FeedbackLevel = "quiet" | "medium" | "loud";

// ── App Screens (used by React Router routes) ─────────────────────────────────

export type AppRoute = "/" | "/players" | "/mode" | "/sing" | "/results";
