import { ChevronDown } from "lucide-react";
import type { RegionId } from "@/types/songs";
import { REGIONS, REGION_IDS } from "@/data/songs/regions";

interface RegionPickerProps {
  selected: RegionId;
  onChange: (region: RegionId) => void;
}

export function RegionPicker({ selected, onChange }: RegionPickerProps) {
  const selectedRegion = REGIONS[selected];
  return (
    <div className="relative inline-flex items-center">
      <span className="absolute left-3 text-base pointer-events-none select-none">
        {selectedRegion.flag}
      </span>
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value as RegionId)}
        className="appearance-none pl-9 pr-8 py-1.5 rounded-full text-sm font-semibold
          bg-white/[0.06] border border-white/[0.15] text-white
          focus:outline-none focus:border-[#ff2d95] focus:shadow-[0_0_12px_rgba(255,45,149,0.2)]
          transition-all duration-200 cursor-pointer"
      >
        {REGION_IDS.map((id) => (
          <option key={id} value={id} className="bg-[#1a0a2e] text-white">
            {REGIONS[id].label}
          </option>
        ))}
      </select>
      <ChevronDown size={13} className="absolute right-2.5 text-white/40 pointer-events-none" />
    </div>
  );
}
