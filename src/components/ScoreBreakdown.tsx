import type { RankedPlayer } from "@/types";

interface ScoreBreakdownProps {
  players: RankedPlayer[];
}

function BreakdownRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between text-sm py-0.5 opacity-70">
      <span>{label}</span>
      <span className="font-extrabold opacity-100">{value}</span>
    </div>
  );
}

export function ScoreBreakdown({ players }: ScoreBreakdownProps) {
  return (
    <div className="flex gap-3 flex-wrap justify-center max-w-[900px]">
      {players.map((p) => (
        <div
          key={p.index}
          className="text-center p-3 px-4 rounded-2xl bg-white/[0.03] min-w-[140px]"
        >
          <h4 className="text-xs uppercase tracking-widest opacity-50 mb-2">{p.name}</h4>
          <BreakdownRow label="Energy" value={p.score.energy} />
          <BreakdownRow label="Pitch Range" value={p.score.pitch} />
          <BreakdownRow label="Sustain" value={p.score.sustain} />
          <BreakdownRow label="Duration" value={p.score.duration} />
          <BreakdownRow label="Time" value={`${Math.round(p.score.time)}s`} />
        </div>
      ))}
    </div>
  );
}
