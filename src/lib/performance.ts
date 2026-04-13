import type { NoteScoringState } from "@/hooks/useNoteScoring";
import type { VisualizerMood } from "@/pages/sing-page-v2/components/VisualizerV2";

export interface PerformanceVisuals {
  mood: VisualizerMood;
  bgClass: string;
}

const NEUTRAL: PerformanceVisuals = { mood: "neutral", bgClass: "" };

export function derivePerformanceVisuals(
  noteScoring: NoteScoringState | null,
  isCurated: boolean
): PerformanceVisuals {
  if (!isCurated || !noteScoring) return NEUTRAL;

  if (noteScoring.streak >= 20) {
    return { mood: "great", bgClass: "bg-performance-great" };
  }
  if (noteScoring.streak >= 10) {
    return { mood: "positive", bgClass: "bg-performance-positive" };
  }
  if (noteScoring.consecutiveMisses >= 4) {
    return { mood: "negative", bgClass: "bg-performance-negative" };
  }
  return NEUTRAL;
}
