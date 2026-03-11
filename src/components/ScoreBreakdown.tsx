import type { RankedPlayer, SongDifficulty } from "@/types";
import { DIFFICULTY_MODIFIERS } from "@/lib/constants";

interface ScoreBreakdownProps {
  players: RankedPlayer[];
  isCurated?: boolean;
  songDifficulty?: SongDifficulty;
}

function BreakdownRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between text-sm py-0.5 opacity-70">
      <span>{label}</span>
      <span className="font-extrabold opacity-100">{value}</span>
    </div>
  );
}

export function ScoreBreakdown({ players, isCurated, songDifficulty }: ScoreBreakdownProps) {
  const modifier = songDifficulty ? DIFFICULTY_MODIFIERS[songDifficulty] ?? 1.0 : 1.0;
  const modifierLabel =
    modifier > 1 ? `+${Math.round((modifier - 1) * 100)}%` : modifier < 1 ? `${Math.round((modifier - 1) * 100)}%` : "—";

  return (
    <div className="flex gap-3 flex-wrap justify-center w-full max-w-[900px]">
      {players.map((p) => (
        <div
          key={p.index}
          className="text-center p-3 px-4 rounded-2xl bg-white/[0.03] min-w-[130px] flex-1"
        >
          <h4 className="text-xs uppercase tracking-widest opacity-50 mb-2">{p.name}</h4>
          <BreakdownRow label="Energy" value={p.score.energy} />
          <BreakdownRow label="Pitch Range" value={p.score.pitch} />
          <BreakdownRow label="Sustain" value={p.score.sustain} />
          <BreakdownRow label="Duration" value={p.score.duration} />
          <BreakdownRow label="Time" value={`${Math.round(p.score.time)}s`} />
          {isCurated && songDifficulty && (
            <BreakdownRow
              label={`Difficulty (${songDifficulty})`}
              value={modifierLabel}
            />
          )}
        </div>
      ))}
    </div>
  );
}
