import { cn } from "@/lib/utils";
import { rankPlayersByCumulative } from "@/lib/utils";
import type { Player } from "@/types";

interface CumulativeStandingsProps {
  players: Player[];
  cumulativeScores: number[];
  currentRound: number;
}

export function CumulativeStandings({
  players,
  cumulativeScores,
  currentRound,
}: CumulativeStandingsProps) {
  const ranked = rankPlayersByCumulative(players, cumulativeScores);

  return (
    <div className="w-full max-w-[600px] px-0">
      <div className="text-xs uppercase tracking-[3px] opacity-40 text-center mb-2.5">
        Tournament Standings
      </div>
      <div className="flex flex-col gap-1.5">
        {ranked.map((entry, rank) => {
          const avg = currentRound > 0 ? Math.round(entry.cum / currentRound) : 0;
          return (
            <div
              key={entry.index}
              className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/[0.03]"
            >
              <div className="font-display text-lg w-7 text-center opacity-50">
                {rank + 1}
              </div>
              <div className="flex-1 font-bold text-base text-white/90">
                {entry.player.name || `Player ${entry.index + 1}`}
              </div>
              <div
                className={cn(
                  "font-display text-2xl",
                  rank === 0 ? "neon-gold" : "",
                )}
              >
                {entry.cum}
              </div>
              <div className="text-xs opacity-40 min-w-[56px] text-right">
                avg {avg}/rd
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
