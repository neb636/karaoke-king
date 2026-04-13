import { cn } from "@/lib/utils";
import type { GameModeConfig, GameModeKey } from "@/types";

const modeAccent: Record<GameModeKey, { border: string; glow: string; bg: string; label: string }> =
  {
    quick: {
      border: "border-[#00e5ff]",
      glow: "shadow-[0_0_20px_rgba(0,229,255,0.25)]",
      bg: "bg-[rgba(0,229,255,0.07)]",
      label: "neon-cyan",
    },
    tournament3: {
      border: "border-[#ffd700]",
      glow: "shadow-[0_0_20px_rgba(255,215,0,0.25)]",
      bg: "bg-[rgba(255,215,0,0.07)]",
      label: "neon-gold",
    },
    tournament5: {
      border: "border-[#ff2d95]",
      glow: "shadow-[0_0_20px_rgba(255,45,149,0.25)]",
      bg: "bg-[rgba(255,45,149,0.07)]",
      label: "neon-pink",
    },
    tournament10: {
      border: "border-[#39ff14]",
      glow: "shadow-[0_0_20px_rgba(57,255,20,0.25)]",
      bg: "bg-[rgba(57,255,20,0.07)]",
      label: "neon-green",
    },
  };

interface ModeCardProps {
  modeKey: GameModeKey;
  config: GameModeConfig;
  selected: boolean;
  onSelect: () => void;
}

export function ModeCard({ modeKey, config, selected, onSelect }: ModeCardProps) {
  const accent = modeAccent[modeKey];
  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex flex-col items-center justify-center gap-0.5 rounded-xl cursor-pointer select-none",
        "bg-white/[0.04] border border-white/[0.08]",
        "transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.07]",
        "px-3 py-4 min-h-[110px]",
        selected && [accent.border, accent.glow, accent.bg, "border"]
      )}
    >
      <div className="text-3xl leading-none mb-1">{config.icon}</div>
      <div className={cn("font-display text-base tracking-widest", accent.label)}>
        {config.label.toUpperCase()}
      </div>
      <div className="text-[10px] uppercase tracking-wide text-white/40 mt-0.5">
        {config.rounds === 1 ? "1 Round" : `${config.rounds} Rounds`}
      </div>
    </button>
  );
}
