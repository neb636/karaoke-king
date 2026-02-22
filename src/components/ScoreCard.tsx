import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { RankedPlayer } from "@/types";

const MEDALS = ["👑", "🥈", "🥉"];

interface ScoreCardProps {
  player: RankedPlayer;
  rank: number; // 0-indexed
}

export function ScoreCard({ player, rank }: ScoreCardProps) {
  const scoreRef = useRef<HTMLDivElement>(null);

  // Animate score count-up on mount
  useEffect(() => {
    const el = scoreRef.current;
    if (!el) return;
    const target = player.score.total;
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 40));
    const interval = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = String(current);
      if (current >= target) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [player.score.total]);

  const medal = rank < 3 ? MEDALS[rank] : "🎤";

  return (
    <div
      className={cn(
        "flex flex-col items-center p-4 px-5 rounded-2xl",
        "flex-1 min-w-[110px] max-w-[180px]",
        "bg-white/[0.04] border border-white/[0.08]",
        "transition-all duration-500",
        rank === 0 && "scale-105 border-[#ffd700] shadow-[0_0_40px_rgba(255,215,0,0.2)]",
        rank === 1 && "border-[#c0c0c0] shadow-[0_0_20px_rgba(192,192,192,0.13)]",
        rank === 2 && "border-[#cd7f32] shadow-[0_0_20px_rgba(205,127,50,0.13)]",
      )}
    >
      <div className="text-2xl mb-1">{medal}</div>
      <div
        className="text-base font-extrabold mb-0.5 truncate w-full text-center"
        style={{ color: player.color.hex }}
      >
        {player.name}
        {player.score.bumpers && (
          <span className="ml-1 text-xs opacity-50">⚡</span>
        )}
      </div>
      <div className="text-xs uppercase tracking-widest opacity-40 mb-2">
        #{rank + 1}
      </div>
      <div
        ref={scoreRef}
        className={cn(
          "font-display text-[clamp(2.5rem,8vw,3.5rem)] leading-none",
          rank === 0 ? "neon-gold" : "",
        )}
      >
        0
      </div>
      <div className="text-xs opacity-50 mt-0.5">/ 100</div>
    </div>
  );
}
