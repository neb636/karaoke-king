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
    <div className="flex gap-2 mt-3 mb-3">
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08]">
        <span className="text-[10px] uppercase tracking-[2px] opacity-40">Time</span>
        <span className="text-xl font-extrabold neon-cyan tabular-nums">{formatTime(elapsed)}</span>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08]">
        <span className="text-[10px] uppercase tracking-[2px] opacity-40">Energy</span>
        <span className="text-xl font-extrabold neon-pink tabular-nums">{avgEnergy}</span>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08]">
        <span className="text-[10px] uppercase tracking-[2px] opacity-40">
          {showNoteAccuracy ? "Note Acc" : "Pitch Hits"}
        </span>
        <span className="text-xl font-extrabold neon-gold tabular-nums">
          {showNoteAccuracy ? `${noteAccuracy}%` : pitchHits}
        </span>
      </div>
    </div>
  );
}
