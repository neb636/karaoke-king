import { create } from "zustand";
import { GAME_MODES, PLAYER_COLORS } from "@/lib/constants";
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
  updatePlayerBumpers: (index: number, bumpers: boolean) => void;
  setSelectedMode: (mode: GameModeKey) => void;
  confirmMode: () => void;
  initNewGame: () => void;
  startRound: () => void;
  recordScore: (score: PlayerScore) => void;
  advancePlayer: () => void;
  nextRound: () => void;
  resetToPlayerSetup: () => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeDefaultPlayers(): Player[] {
  return [0, 1].map((i) => ({
    name: "",
    bumpers: false,
    color: PLAYER_COLORS[i % PLAYER_COLORS.length]!,
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
    const i = players.length;
    set({
      players: [
        ...players,
        {
          name: "",
          bumpers: false,
          color: PLAYER_COLORS[i % PLAYER_COLORS.length]!,
        },
      ],
    });
  },

  removePlayer: (index) => {
    const { players } = get();
    if (players.length <= 2) return;
    const updated = players.filter((_, i) => i !== index).map((p, i) => ({
      ...p,
      color: PLAYER_COLORS[i % PLAYER_COLORS.length]!,
    }));
    set({ players: updated });
  },

  updatePlayerName: (index, name) => {
    const players = [...get().players];
    const player = players[index];
    if (player) players[index] = { ...player, name };
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
}));
