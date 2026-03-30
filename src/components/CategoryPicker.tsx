import { cn } from "@/lib/utils";
import type { RegionId } from "@/types/songs";
import { REGIONS, REGION_IDS } from "@/data/songs/regions";

interface RegionPickerProps {
  selected: RegionId[];
  onToggle: (region: RegionId) => void;
}

export function RegionPicker({ selected, onToggle }: RegionPickerProps) {
  return (
    <div className="flex flex-wrap gap-2 w-full max-w-[900px]">
      {REGION_IDS.map((id) => {
        const region = REGIONS[id];
        const isActive = selected.includes(id);
        return (
          <button
            key={id}
            type="button"
            onClick={() => onToggle(id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold",
              "border transition-all duration-200 select-none",
              isActive
                ? "bg-[#ff2d95]/20 border-[#ff2d95]/60 text-white shadow-[0_0_8px_rgba(255,45,149,0.3)]"
                : "bg-white/[0.05] border-white/15 text-white/55 hover:border-white/30 hover:text-white/85",
            )}
          >
            <span>{region.flag}</span>
            <span>{region.label}</span>
          </button>
        );
      })}
    </div>
  );
}
