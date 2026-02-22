import { cn } from "@/lib/utils";

interface CountdownOverlayProps {
  isActive: boolean;
  value: string | number;
}

export function CountdownOverlay({ isActive, value }: CountdownOverlayProps) {
  if (!isActive) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[rgba(10,10,26,0.85)] z-50">
      <div
        key={String(value)} // re-mount to retrigger animation on each change
        className={cn("font-display text-[12rem] leading-none animate-count-pop neon-gold")}
      >
        {value}
      </div>
    </div>
  );
}
