import type { GameModeConfig, GameModeKey, PlayerColor } from "@/types";

export const PLAYER_COLORS: PlayerColor[] = [
  { name: "neon-pink", hex: "#ff2d95" },
  { name: "neon-cyan", hex: "#00e5ff" },
  { name: "neon-gold", hex: "#ffd700" },
  { name: "neon-green", hex: "#39ff14" },
  { name: "neon-pink", hex: "#ff6ec7" },
  { name: "neon-cyan", hex: "#00b8d4" },
  { name: "neon-gold", hex: "#ffaa00" },
  { name: "neon-green", hex: "#76ff03" },
];

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

// Scoring weights
export const SCORE_WEIGHTS = {
  energy: 0.4,
  pitch: 0.3,
  sustain: 0.2,
  duration: 0.1,
} as const;
