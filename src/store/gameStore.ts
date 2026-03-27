import { create } from "zustand";
import { GAME_MODES } from "@/lib/constants";
import { savePlayerNames } from "@/services/playerHistory";
import type { GameModeKey, Player, PlayerScore } from "@/types";

// ── Types ────────────────────────────────────────────────────────────────────

interface GameState {
  // Player configuration
  players: Player[];

  // Game mode
  selectedMode: GameModeKey;
  totalRounds: number;

  // Round tracking
  currentRound: number;
  currentPlayer: number;

  // Scores: scores[playerIdx] for the current round, null until scored
  scores: (PlayerScore | null)[];

  // Cumulative scores across all rounds
  cumulativeScores: number[];

  // Actions
  addPlayer: () => void;
  removePlayer: (index: number) => void;
  updatePlayerName: (index: number, name: string) => void;
  updatePlayerEmoji: (index: number, emoji: string) => void;
  updatePlayerBumpers: (index: number, bumpers: boolean) => void;
  setSelectedMode: (mode: GameModeKey) => void;
  confirmMode: () => void;
  initNewGame: () => void;
  startRound: () => void;
  recordScore: (score: PlayerScore) => void;
  advancePlayer: () => void;
  nextRound: () => void;
  resetToPlayerSetup: () => void;
  loadSavedPlayers: (names: string[]) => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeDefaultPlayers(): Player[] {
  return [0, 1].map(() => ({
    name: "",
    emoji: "",
    bumpers: false,
  }));
}

// ── Store ────────────────────────────────────────────────────────────────────

export const useGameStore = create<GameState>((set, get) => ({
  players: makeDefaultPlayers(),
  selectedMode: "quick",
  totalRounds: 1,
  currentRound: 1,
  currentPlayer: 0,
  scores: [],
  cumulativeScores: [],

  addPlayer: () => {
    const { players } = get();
    if (players.length >= 8) return;
    const updated = [...players, { name: "", emoji: "", bumpers: false }];
    set({ players: updated });
    savePlayerNames(updated.map((p) => p.name));
  },

  removePlayer: (index) => {
    const { players } = get();
    if (players.length <= 2) return;
    const updated = players.filter((_, i) => i !== index);
    set({ players: updated });
    savePlayerNames(updated.map((p) => p.name));
  },

  updatePlayerName: (index, name) => {
    const players = [...get().players];
    const player = players[index];
    if (player) players[index] = { ...player, name };
    set({ players });
    savePlayerNames(players.map((p) => p.name));
  },

  updatePlayerEmoji: (index, emoji) => {
    const players = [...get().players];
    const player = players[index];
    if (player) players[index] = { ...player, emoji };
    set({ players });
  },

  updatePlayerBumpers: (index, bumpers) => {
    const players = [...get().players];
    const player = players[index];
    if (player) players[index] = { ...player, bumpers };
    set({ players });
  },

  setSelectedMode: (mode) => {
    set({ selectedMode: mode });
  },

  confirmMode: () => {
    const { selectedMode } = get();
    set({ totalRounds: GAME_MODES[selectedMode].rounds });
  },

  initNewGame: () => {
    const { players } = get();
    set({
      currentRound: 1,
      cumulativeScores: new Array(players.length).fill(0),
    });
    get().startRound();
  },

  startRound: () => {
    const { players } = get();
    set({
      scores: new Array(players.length).fill(null),
      currentPlayer: 0,
    });
  },

  recordScore: (score) => {
    const { currentPlayer, scores, cumulativeScores } = get();
    const newScores = [...scores];
    newScores[currentPlayer] = score;
    const newCumulative = [...cumulativeScores];
    newCumulative[currentPlayer] = (newCumulative[currentPlayer] ?? 0) + score.total;
    set({ scores: newScores, cumulativeScores: newCumulative });
  },

  advancePlayer: () => {
    set((s) => ({ currentPlayer: s.currentPlayer + 1 }));
  },

  nextRound: () => {
    set((s) => ({ currentRound: s.currentRound + 1 }));
    get().startRound();
  },

  resetToPlayerSetup: () => {
    set({
      players: makeDefaultPlayers(),
      selectedMode: "quick",
      totalRounds: 1,
      currentRound: 1,
      currentPlayer: 0,
      scores: [],
      cumulativeScores: [],
    });
  },

  loadSavedPlayers: (names) => {
    const count = Math.min(Math.max(names.length, 2), 8);
    const players: Player[] = Array.from({ length: count }, (_, i) => ({
      name: names[i] ?? "",
      emoji: "",
      bumpers: false,
    }));
    set({ players });
  },
}));
