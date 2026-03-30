import { formatTime } from "@/lib/utils";
import type { ScoringMode } from "@/lib/constants";

interface StatsStripProps {
  elapsed: number;
  avgEnergy: number;
  pitchHits: number;
  noteAccuracy: number;
  isCurated: boolean;
  scoringMode: ScoringMode;
}

export function StatsStrip({
  elapsed,
  avgEnergy,
  pitchHits,
  noteAccuracy,
  isCurated,
  scoringMode,
}: StatsStripProps) {
  const showNoteAccuracy = isCurated && scoringMode === "expert";

  return (
    <div className="flex items-center gap-4 md:gap-6 text-sm tabular-nums">
      <span className="flex items-center gap-1.5">
        <span className="text-[10px] uppercase tracking-[2px] text-white/30">Time</span>
        <span className="font-bold neon-cyan">{formatTime(elapsed)}</span>
      </span>
      <span className="text-white/10">|</span>
      <span className="flex items-center gap-1.5">
        <span className="text-[10px] uppercase tracking-[2px] text-white/30">Energy</span>
        <span className="font-bold neon-pink">{avgEnergy}</span>
      </span>
      <span className="text-white/10">|</span>
      <span className="flex items-center gap-1.5">
        <span className="text-[10px] uppercase tracking-[2px] text-white/30">
          {showNoteAccuracy ? "Acc" : "Pitch"}
        </span>
        <span className="font-bold neon-gold">
          {showNoteAccuracy ? `${noteAccuracy}%` : pitchHits}
        </span>
      </span>
    </div>
  );
}
