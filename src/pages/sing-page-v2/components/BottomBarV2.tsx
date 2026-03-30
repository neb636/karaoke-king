import { memo } from "react";
import { formatTime } from "@/lib/utils";
import type { ScoringMode } from "@/lib/constants";

interface BottomBarV2Props {
  elapsed: number;
  avgEnergy: number;
  energyPct: number;
  pitchHits: number;
  noteAccuracy: number;
  isCurated: boolean;
  scoringMode: ScoringMode;
  finishSecondsLeft: number;
  finishTimerDone: boolean;
  onStop: () => void;
}

export const BottomBarV2 = memo(function BottomBarV2({
  elapsed,
  avgEnergy,
  energyPct,
  pitchHits,
  noteAccuracy,
  isCurated,
  scoringMode,
  finishSecondsLeft,
  finishTimerDone,
  onStop,
}: BottomBarV2Props) {
  const showNoteAccuracy = isCurated && scoringMode === "expert";

  return (
    <div className="w-full flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap">
      {/* Stat pills */}
      <StatPill label="Time" value={formatTime(elapsed)} colorClass="neon-cyan" />
      <StatPill label="Energy" value={String(avgEnergy)} colorClass="neon-pink" />
      {isCurated && (
        <StatPill
          label={showNoteAccuracy ? "Acc" : "Pitch"}
          value={showNoteAccuracy ? `${noteAccuracy}%` : String(pitchHits)}
          colorClass="neon-gold"
        />
      )}

      {/* Energy bar (takes remaining space) */}
      <div className="flex-1 min-w-[60px] h-[4px] bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#ff2d95] via-[#c026d3] to-[#ffd700]"
          style={{ width: `${energyPct}%`, transition: "width 100ms" }}
        />
      </div>

      {/* Finish / Stop button */}
      <button
        onClick={onStop}
        disabled={isCurated && !finishTimerDone}
        className={
          isCurated
            ? `shrink-0 rounded-lg px-3 py-1.5 text-[0.72rem] font-semibold transition-opacity ${
                finishTimerDone
                  ? "bg-red-700/30 border border-red-600/50 text-white cursor-pointer hover:bg-red-700/40"
                  : "bg-red-700/15 border border-red-700/30 text-white/45 cursor-not-allowed"
              }`
            : "shrink-0 rounded-lg px-3 py-1.5 text-[0.72rem] font-semibold bg-white/[0.06] border border-white/15 text-white/60 cursor-pointer hover:bg-white/10 hover:text-white/80 transition-colors"
        }
      >
        {isCurated
          ? finishTimerDone
            ? "Finish"
            : `${finishSecondsLeft}s`
          : "Stop"}
      </button>
    </div>
  );
});

/* ── Stat pill (tiny inline component) ──────────────────────────────── */

interface StatPillProps {
  label: string;
  value: string;
  colorClass: string;
}

const StatPill = memo(function StatPill({ label, value, colorClass }: StatPillProps) {
  return (
    <div className="flex flex-col items-center bg-white/[0.04] border border-white/[0.06] rounded-lg px-2 py-1 min-w-[44px] sm:min-w-[50px]">
      <span className="text-[0.5rem] uppercase tracking-[1.5px] text-white/30 leading-none">
        {label}
      </span>
      <span className={`font-display text-sm sm:text-base leading-tight tabular-nums ${colorClass}`}>
        {value}
      </span>
    </div>
  );
});
