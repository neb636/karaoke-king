import { cn } from "@/lib/utils";
import type { GameModeConfig, GameModeKey } from "@/types";

const modeColorClass: Record<GameModeKey, string> = {
  quick: "neon-cyan",
  tournament3: "neon-gold",
  tournament5: "neon-pink",
  tournament10: "neon-green",
};

interface ModeCardProps {
  modeKey: GameModeKey;
  config: GameModeConfig;
  selected: boolean;
  onSelect: () => void;
}

export function ModeCard({ modeKey, config, selected, onSelect }: ModeCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex flex-col items-center justify-center gap-1 rounded-2xl cursor-pointer select-none",
        "bg-white/[0.04] border-2 border-white/[0.08]",
        "transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02] hover:bg-white/[0.07]",
        "p-6 min-h-[140px]",
        selected && "border-[#ff2d95] shadow-[0_0_24px_rgba(255,45,149,0.27)] bg-[rgba(255,45,149,0.1)]",
      )}
    >
      <div className="text-4xl leading-none mb-1">{config.icon}</div>
      <div className={cn("font-display text-xl tracking-widest", modeColorClass[modeKey])}>
        {config.label.toUpperCase()}
      </div>
      <div className="text-xs uppercase tracking-wide text-white/50">{config.description}</div>
      <div className="mt-1 text-xs bg-white/[0.08] rounded-full px-3 py-0.5 tracking-wide text-white/70">
        {config.rounds === 1 ? "1 Round" : `${config.rounds} Rounds`}
      </div>
    </button>
  );
}
