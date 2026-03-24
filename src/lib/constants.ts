import type { GameModeConfig, GameModeKey } from "@/types";

export const GAME_MODES: Record<GameModeKey, GameModeConfig> = {
  quick: {
    label: "Quick Match",
    rounds: 1,
    icon: "⚡",
    description: "One round, pure glory",
  },
  tournament3: {
    label: "Tournament",
    rounds: 3,
    icon: "🏆",
    description: "Best of three rounds",
  },
  tournament5: {
    label: "Championship",
    rounds: 5,
    icon: "🔥",
    description: "Prove your dominance",
  },
  tournament10: {
    label: "Marathon",
    rounds: 10,
    icon: "👑",
    description: "The ultimate showdown",
  },
};

export const GAME_MODE_KEYS = Object.keys(GAME_MODES) as GameModeKey[];

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 8;

// Audio / Scoring
export const NOISE_FLOOR = 0.02;
export const MAX_DURATION_BONUS = 60; // seconds cap for duration score
export const FEEDBACK_COOLDOWN = 1800; // ms between feedback changes
export const BUMPERS_MULTIPLIER = 1.3; // 30% score boost

// Difficulty colors
export const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "#39ff14",
  medium: "#00e5ff",
  hard: "#ffd700",
  expert: "#ff2d95",
};

// Difficulty score modifiers (applied to final score in curated mode)
export const DIFFICULTY_MODIFIERS: Record<string, number> = {
  easy: 0.95,
  medium: 1.0,
  hard: 1.1,
  expert: 1.15,
};

// Scoring weights — freeform mode
export const SCORE_WEIGHTS = {
  energy: 0.4,
  pitch: 0.3,
  sustain: 0.2,
  duration: 0.1,
} as const;

// Scoring weights — curated mode (pitch accuracy replaces variety; duration weighted more)
export const CURATED_SCORE_WEIGHTS = {
  energy: 0.3,
  pitch: 0.35,
  sustain: 0.2,
  duration: 0.15,
} as const;

// Semitone tolerance for pitch accuracy scoring (±N semitones = "hit")
export const PITCH_ACCURACY_TOLERANCE_SEMITONES = 1;
