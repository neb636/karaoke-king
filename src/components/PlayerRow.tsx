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
  const checkboxId = `assist-${index}`;

  return (
    <div className="flex items-center gap-2.5 w-full animate-slide-in">
      {/* Player number */}
      <span
        className="font-display text-lg w-7 text-center flex-shrink-0 self-start pt-2.5"
        style={{ color: player.color.hex }}
      >
        {index + 1}
      </span>

      {/* Name input + Assist toggle stacked */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <input
          type="text"
          value={player.name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={`Player ${index + 1}...`}
          maxLength={16}
          autoComplete="off"
          className={cn(
            "w-full text-center font-semibold text-lg",
            "bg-white/5 border-2 border-white/15 rounded-2xl",
            "px-4 py-2.5 text-white outline-none",
            "transition-all duration-200",
            "focus:border-[#ff2d95] focus:shadow-[0_0_12px_rgba(255,45,149,0.27)]",
            "placeholder:text-white/30",
          )}
        />

        {/* Assist toggle */}
        <div
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl w-fit cursor-pointer select-none",
            "border transition-all duration-200",
            player.bumpers
              ? "bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/15"
              : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20",
          )}
          onClick={() => onBumpersChange(!player.bumpers)}
        >
          <input
            type="checkbox"
            id={checkboxId}
            checked={player.bumpers}
            onChange={(e) => onBumpersChange(e.target.checked)}
            className="w-3.5 h-3.5 cursor-pointer accent-[#00e5ff]"
            onClick={(e) => e.stopPropagation()}
          />
          <label
            htmlFor={checkboxId}
            className={cn(
              "text-xs font-semibold uppercase tracking-wide cursor-pointer transition-colors",
              player.bumpers ? "text-[#00e5ff]" : "text-white/40",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            Assist
          </label>
        </div>
      </div>

      {/* Remove button */}
      <button
        onClick={onRemove}
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 self-start mt-1",
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
