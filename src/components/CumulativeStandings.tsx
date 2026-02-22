import { cn } from "@/lib/utils";
import type { Player } from "@/types";
import { PLAYER_COLORS } from "@/lib/constants";

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
  const ranked = players
    .map((player, i) => ({
      player,
      index: i,
      cum: cumulativeScores[i] ?? 0,
      color: PLAYER_COLORS[i % PLAYER_COLORS.length]!,
    }))
    .sort((a, b) => b.cum - a.cum);

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
              <div
                className="flex-1 font-bold text-base"
                style={{ color: entry.color.hex }}
              >
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
