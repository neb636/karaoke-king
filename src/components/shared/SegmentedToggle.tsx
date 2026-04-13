import { cn } from "@/lib/utils";

export interface SegmentedOption {
  value: string;
  label: string;
  activeClasses: string;
}

interface SegmentedToggleProps {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
}

export function SegmentedToggle({ options, value, onChange }: SegmentedToggleProps) {
  return (
    <div className="flex rounded-full bg-white/[0.06] border border-white/10 p-1 gap-0">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-5 py-2 rounded-full text-sm font-bold uppercase tracking-widest transition-all duration-200",
            value === opt.value ? opt.activeClasses : "text-white/50 hover:text-white/80"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
