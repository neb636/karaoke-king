import type { RankedPlayer, CuratedSong } from "@/types";
import { DIFFICULTY_MODIFIERS } from "@/lib/constants";
import type { ScoringMode } from "@/types";

interface ScoreBreakdownProps {
  players: RankedPlayer[];
  isCurated?: boolean;
  getPlayerSong?: (playerIndex: number) => CuratedSong | null;
  scoringMode?: ScoringMode;
}

function BreakdownRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between text-sm py-0.5 opacity-70">
      <span>{label}</span>
      <span className="font-extrabold opacity-100">{value}</span>
    </div>
  );
}

function difficultyLabel(modifier: number): string {
  if (modifier > 1) return `+${Math.round((modifier - 1) * 100)}%`;
  if (modifier < 1) return `${Math.round((modifier - 1) * 100)}%`;
  return "—";
}

export function ScoreBreakdown({
  players,
  isCurated,
  getPlayerSong,
  scoringMode,
}: ScoreBreakdownProps) {
  const isExpert = scoringMode === "expert";
  return (
    <div className="flex gap-3 flex-wrap justify-center w-full max-w-[900px]">
      {players.map((p) => {
        const song = isCurated && getPlayerSong ? getPlayerSong(p.index) : null;
        const modifier = song ? (DIFFICULTY_MODIFIERS[song.difficulty] ?? 1.0) : 1.0;
        const s = p.score;
        const hasNoteData = s.noteAccuracy != null;

        return (
          <div
            key={p.index}
            className="text-center p-3 px-4 rounded-2xl bg-white/[0.03] min-w-[130px] flex-1"
          >
            <h4 className="text-xs uppercase tracking-widest opacity-50 mb-2">{p.name}</h4>

            {hasNoteData ? (
              <>
                <BreakdownRow label="Note Accuracy" value={`${s.noteAccuracy}%`} />
                <BreakdownRow label="Energy" value={s.energy} />
                {s.bestStreak != null && s.bestStreak > 0 && (
                  <BreakdownRow label="Best Streak" value={`${s.bestStreak} notes`} />
                )}
                {isExpert && s.perfects != null && (
                  <BreakdownRow
                    label="Grades"
                    value={`${s.perfects}P / ${s.goods ?? 0}G / ${s.noteMisses ?? 0}M`}
                  />
                )}
                {!isExpert && s.perfects != null && (
                  <BreakdownRow
                    label="Perfect Notes"
                    value={s.perfects}
                  />
                )}
                {s.goldenTotal != null && s.goldenTotal > 0 && (
                  <BreakdownRow
                    label="Golden Notes"
                    value={`${s.goldenHits ?? 0} / ${s.goldenTotal}`}
                  />
                )}
                <BreakdownRow label="Time" value={`${Math.round(s.time)}s`} />
              </>
            ) : (
              <>
                <BreakdownRow label="Energy" value={s.energy} />
                <BreakdownRow
                  label={isExpert ? "Note Accuracy" : "Pitch Range"}
                  value={s.pitch}
                />
                <BreakdownRow label="Sustain" value={s.sustain} />
                <BreakdownRow label="Duration" value={s.duration} />
                <BreakdownRow label="Time" value={`${Math.round(s.time)}s`} />
              </>
            )}

            {song && (
              <BreakdownRow
                label={`Difficulty (${song.difficulty})`}
                value={difficultyLabel(modifier)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
