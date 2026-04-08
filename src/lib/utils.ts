import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Player, PlayerScore, RankedPlayer } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const EMPTY_SCORE: PlayerScore = {
  total: 0,
  energy: 0,
  pitch: 0,
  sustain: 0,
  duration: 0,
  time: 0,
  bumpers: false,
};

export function rankPlayersByScore(
  players: Player[],
  scores: (PlayerScore | null)[]
): RankedPlayer[] {
  return players
    .map((player, i) => ({
      name: player.name || `Player ${i + 1}`,
      index: i,
      score: scores[i] ?? EMPTY_SCORE,
    }))
    .sort((a, b) => b.score.total - a.score.total);
}

export function rankPlayersByCumulative(
  players: Player[],
  cumulativeScores: number[]
): { player: Player; index: number; cum: number }[] {
  return players
    .map((player, i) => ({ player, index: i, cum: cumulativeScores[i] ?? 0 }))
    .sort((a, b) => b.cum - a.cum);
}
