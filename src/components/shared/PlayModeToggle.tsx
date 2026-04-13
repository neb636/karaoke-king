import { SegmentedToggle } from "@/components/shared/SegmentedToggle";
import type { PlayMode } from "@/types/songs";

interface PlayModeToggleProps {
  mode: PlayMode;
  onChange: (mode: PlayMode) => void;
}

const OPTIONS = [
  {
    value: "curated",
    label: "Curated",
    activeClasses:
      "bg-gradient-to-r from-[#ff2d95] to-[#ff6ec7] text-white shadow-[0_0_16px_rgba(255,45,149,0.35)]",
  },
  {
    value: "freeform",
    label: "Freeform",
    activeClasses:
      "bg-gradient-to-r from-[#00e5ff] to-[#00b8d4] text-white shadow-[0_0_16px_rgba(0,229,255,0.35)]",
  },
];

export function PlayModeToggle({ mode, onChange }: PlayModeToggleProps) {
  return (
    <SegmentedToggle options={OPTIONS} value={mode} onChange={(v) => onChange(v as PlayMode)} />
  );
}
