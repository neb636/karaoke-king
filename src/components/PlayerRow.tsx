import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Player } from "@/types";

interface PlayerRowProps {
  player: Player;
  index: number;
  showRemove: boolean;
  onNameChange: (name: string) => void;
  onBumpersChange: (bumpers: boolean) => void;
  onRemove: () => void;
}

export function PlayerRow({
  player,
  index,
  showRemove,
  onNameChange,
  onBumpersChange,
  onRemove,
}: PlayerRowProps) {
  const checkboxId = `bumpers-${index}`;

  return (
    <div className="flex items-center gap-2.5 w-full animate-slide-in">
      {/* Player number */}
      <span
        className="font-display text-lg w-7 text-center flex-shrink-0"
        style={{ color: player.color.hex }}
      >
        {index + 1}
      </span>

      {/* Name input */}
      <input
        type="text"
        value={player.name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder={`Player ${index + 1}...`}
        maxLength={16}
        autoComplete="off"
        className={cn(
          "flex-1 text-center font-semibold text-lg",
          "bg-white/5 border-2 border-white/15 rounded-2xl",
          "px-4 py-2.5 text-white outline-none",
          "transition-all duration-200",
          "focus:border-[#ff2d95] focus:shadow-[0_0_12px_rgba(255,45,149,0.27)]",
          "placeholder:text-white/30",
        )}
      />

      {/* Bumpers toggle */}
      <div
        className={cn(
          "flex items-center gap-1.5 px-3 py-2 rounded-xl flex-shrink-0 cursor-pointer select-none",
          "bg-white/5 border border-white/10",
          "transition-all duration-200 hover:bg-white/10 hover:border-white/20",
        )}
        onClick={() => onBumpersChange(!player.bumpers)}
      >
        <input
          type="checkbox"
          id={checkboxId}
          checked={player.bumpers}
          onChange={(e) => onBumpersChange(e.target.checked)}
          className="w-4 h-4 cursor-pointer accent-[#00e5ff]"
          onClick={(e) => e.stopPropagation()}
        />
        <label
          htmlFor={checkboxId}
          className={cn(
            "text-xs font-semibold uppercase tracking-wide cursor-pointer transition-colors",
            player.bumpers ? "text-[#00e5ff]" : "text-white/50",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          Bumpers
        </label>
      </div>

      {/* Remove button */}
      <button
        onClick={onRemove}
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          "border border-white/15 bg-red-500/15 text-red-400",
          "transition-all duration-150 hover:bg-red-500/35 hover:scale-110",
          showRemove ? "visible" : "invisible",
        )}
        aria-label="Remove player"
      >
        <X size={14} />
      </button>
    </div>
  );
}
