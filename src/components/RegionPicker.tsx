import { cn } from "@/lib/utils";
import type { RegionId } from "@/types/songs";
import { REGIONS, REGION_IDS } from "@/data/songs/regions";

interface RegionPickerProps {
  selected: RegionId;
  onChange: (region: RegionId) => void;
}

export function RegionPicker({ selected, onChange }: RegionPickerProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {REGION_IDS.map((id) => {
        const region = REGIONS[id];
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200",
              "border hover:scale-105",
              selected === id
                ? "bg-white/[0.12] border-[#ff2d95] text-white shadow-[0_0_12px_rgba(255,45,149,0.2)]"
                : "bg-white/[0.04] border-white/10 text-white/60 hover:text-white hover:border-white/30",
            )}
          >
            {region.flag} {region.label}
          </button>
        );
      })}
    </div>
  );
}
