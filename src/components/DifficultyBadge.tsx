import { cn } from "@/lib/utils";
import type { SongDifficulty } from "@/types/songs";
import { DIFFICULTY_COLORS } from "@/lib/constants";

interface DifficultyBadgeProps {
  difficulty: SongDifficulty;
  className?: string;
}

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  const color = DIFFICULTY_COLORS[difficulty];
  return (
    <span
      className={cn(
        "inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
        "border",
        className,
      )}
      style={{
        color: color,
        borderColor: `${color}66`,
        backgroundColor: `${color}18`,
      }}
    >
      {difficulty}
    </span>
  );
}
