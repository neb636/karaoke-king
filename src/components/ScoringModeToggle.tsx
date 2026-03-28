import { cn } from "@/lib/utils";
import type { ScoringMode } from "@/lib/constants";

interface ScoringModeToggleProps {
  mode: ScoringMode;
  onChange: (mode: ScoringMode) => void;
}

export function ScoringModeToggle({ mode, onChange }: ScoringModeToggleProps) {
  return (
    <div className="flex rounded-full bg-white/[0.06] border border-white/10 p-1 gap-0">
      <button
        onClick={() => onChange("fun")}
        className={cn(
          "px-5 py-2 rounded-full text-sm font-bold uppercase tracking-widest transition-all duration-200",
          mode === "fun"
            ? "bg-gradient-to-r from-[#39ff14] to-[#7fff00] text-black shadow-[0_0_16px_rgba(57,255,20,0.35)]"
            : "text-white/50 hover:text-white/80",
        )}
      >
        🎉 Fun
      </button>
      <button
        onClick={() => onChange("expert")}
        className={cn(
          "px-5 py-2 rounded-full text-sm font-bold uppercase tracking-widest transition-all duration-200",
          mode === "expert"
            ? "bg-gradient-to-r from-[#ffd700] to-[#ff8c00] text-black shadow-[0_0_16px_rgba(255,215,0,0.35)]"
            : "text-white/50 hover:text-white/80",
        )}
      >
        🎯 Expert
      </button>
    </div>
  );
}
