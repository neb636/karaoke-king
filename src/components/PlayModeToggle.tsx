import { cn } from "@/lib/utils";
import type { PlayMode } from "@/types/songs";

interface PlayModeToggleProps {
  mode: PlayMode;
  onChange: (mode: PlayMode) => void;
}

export function PlayModeToggle({ mode, onChange }: PlayModeToggleProps) {
  return (
    <div className="flex rounded-full bg-white/[0.06] border border-white/10 p-1 gap-0">
      <button
        onClick={() => onChange("curated")}
        className={cn(
          "px-5 py-2 rounded-full text-sm font-bold uppercase tracking-widest transition-all duration-200",
          mode === "curated"
            ? "bg-gradient-to-r from-[#ff2d95] to-[#ff6ec7] text-white shadow-[0_0_16px_rgba(255,45,149,0.35)]"
            : "text-white/50 hover:text-white/80",
        )}
      >
        Curated
      </button>
      <button
        onClick={() => onChange("freeform")}
        className={cn(
          "px-5 py-2 rounded-full text-sm font-bold uppercase tracking-widest transition-all duration-200",
          mode === "freeform"
            ? "bg-gradient-to-r from-[#00e5ff] to-[#00b8d4] text-white shadow-[0_0_16px_rgba(0,229,255,0.35)]"
            : "text-white/50 hover:text-white/80",
        )}
      >
        Freeform
      </button>
    </div>
  );
}
