import { SegmentedToggle } from "@/components/SegmentedToggle";
import type { ScoringMode } from "@/lib/constants";

interface ScoringModeToggleProps {
  mode: ScoringMode;
  onChange: (mode: ScoringMode) => void;
}

const OPTIONS = [
  {
    value: "fun",
    label: "🎉 Fun",
    activeClasses: "bg-gradient-to-r from-[#39ff14] to-[#7fff00] text-black shadow-[0_0_16px_rgba(57,255,20,0.35)]",
  },
  {
    value: "expert",
    label: "🎯 Expert",
    activeClasses: "bg-gradient-to-r from-[#ffd700] to-[#ff8c00] text-black shadow-[0_0_16px_rgba(255,215,0,0.35)]",
  },
];

export function ScoringModeToggle({ mode, onChange }: ScoringModeToggleProps) {
  return (
    <SegmentedToggle
      options={OPTIONS}
      value={mode}
      onChange={(v) => onChange(v as ScoringMode)}
    />
  );
}
