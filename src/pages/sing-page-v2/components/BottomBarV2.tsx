import { memo, useEffect, useRef } from "react";
import { formatTime } from "@/lib/utils";
import type { ScoringMode } from "@/lib/constants";
import type { NoteScoringState } from "@/hooks/useNoteScoring";

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
  noteScoring: NoteScoringState | null;
}

const STAR_THRESHOLDS = [20, 40, 60, 80, 95];

function starRating(score: number): number {
  let stars = 0;
  for (const t of STAR_THRESHOLDS) {
    if (score >= t) stars++;
  }
  return stars;
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
  noteScoring,
}: BottomBarV2Props) {
  const hasNoteScoring = noteScoring !== null && isCurated;
  const liveScore = hasNoteScoring ? noteScoring.liveScore : 0;
  const stars = hasNoteScoring ? starRating(liveScore) : 0;

  return (
    <div className="w-full flex flex-col gap-1.5 shrink-0">
      {/* Streak badge */}
      {hasNoteScoring && noteScoring.streak >= 5 && noteScoring.streakTier && (
        <StreakBadge
          streak={noteScoring.streak}
          label={noteScoring.streakTier.label}
          tierUp={noteScoring.streakTierUp}
        />
      )}

      <div className="w-full flex items-center gap-1.5 sm:gap-2 flex-wrap">
        {/* Live score (curated with note scoring) */}
        {hasNoteScoring ? (
          <>
            <LiveScorePill score={liveScore} />
            <StarsPill stars={stars} />
          </>
        ) : (
          <>
            <StatPill label="Time" value={formatTime(elapsed)} colorClass="neon-cyan" />
            <StatPill label="Energy" value={String(avgEnergy)} colorClass="neon-pink" />
            {isCurated && (
              <StatPill
                label={scoringMode === "expert" ? "Acc" : "Pitch"}
                value={
                  scoringMode === "expert" ? `${noteAccuracy}%` : String(pitchHits)
                }
                colorClass="neon-gold"
              />
            )}
          </>
        )}

        {/* Energy bar */}
        <div className="flex-1 min-w-[60px] h-[4px] bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#ff2d95] via-[#c026d3] to-[#ffd700] transition-all duration-100"
            style={{ width: `${energyPct}%` }}
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
          {isCurated ? (finishTimerDone ? "Finish" : `${finishSecondsLeft}s`) : "Stop"}
        </button>
      </div>
    </div>
  );
});

/* ── Live Score Pill ────────────────────────────────────────────────────────── */

const LiveScorePill = memo(function LiveScorePill({ score }: { score: number }) {
  const displayRef = useRef<HTMLSpanElement>(null);
  const animatedValue = useRef(0);

  useEffect(() => {
    const el = displayRef.current;
    if (!el) return;
    const target = score;
    const start = animatedValue.current;
    const diff = target - start;
    if (Math.abs(diff) < 1) {
      el.textContent = String(target);
      animatedValue.current = target;
      return;
    }
    const step = diff > 0 ? Math.max(1, Math.ceil(diff / 8)) : Math.min(-1, Math.floor(diff / 8));
    const id = setInterval(() => {
      animatedValue.current += step;
      if ((step > 0 && animatedValue.current >= target) || (step < 0 && animatedValue.current <= target)) {
        animatedValue.current = target;
        clearInterval(id);
      }
      el.textContent = String(Math.round(animatedValue.current));
    }, 50);
    return () => clearInterval(id);
  }, [score]);

  return (
    <div className="flex flex-col items-center bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-1 min-w-[52px]">
      <span className="text-[0.5rem] uppercase tracking-[1.5px] text-white/30 leading-none">
        Score
      </span>
      <span ref={displayRef} className="font-display text-base sm:text-lg leading-tight neon-gold tabular-nums">
        0
      </span>
    </div>
  );
});

/* ── Stars Pill ────────────────────────────────────────────────────────────── */

const StarsPill = memo(function StarsPill({ stars }: { stars: number }) {
  return (
    <div className="flex items-center gap-0.5 px-1">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`text-sm transition-all duration-300 ${
            i < stars ? "opacity-100 scale-110 drop-shadow-[0_0_4px_rgba(255,215,0,0.6)]" : "opacity-20 scale-90"
          }`}
          style={{ color: i < stars ? "#ffd700" : "#666" }}
        >
          ★
        </span>
      ))}
    </div>
  );
});

/* ── Streak Badge ──────────────────────────────────────────────────────────── */

const StreakBadge = memo(function StreakBadge({
  streak,
  label,
  tierUp,
}: {
  streak: number;
  label: string;
  tierUp: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-center gap-2 py-0.5 transition-all duration-300 ${
        tierUp ? "animate-streak-pop" : ""
      }`}
    >
      <span className="font-display text-xs tracking-[2px] neon-gold">
        {label}
      </span>
      <span className="font-display text-sm neon-gold tabular-nums">
        {streak}x
      </span>
    </div>
  );
});

/* ── Stat pill (fallback for freeform) ─────────────────────────────────────── */

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
      <span
        className={`font-display text-sm sm:text-base leading-tight tabular-nums ${colorClass}`}
      >
        {value}
      </span>
    </div>
  );
});
