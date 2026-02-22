import { cn } from "@/lib/utils";

interface RoundIndicatorProps {
  totalRounds: number;
  currentRound: number;
}

export function RoundIndicator({ totalRounds, currentRound }: RoundIndicatorProps) {
  if (totalRounds <= 1) return null;

  return (
    <div className="flex gap-2 items-center justify-center">
      {Array.from({ length: totalRounds }, (_, i) => {
        const round = i + 1;
        return (
          <div
            key={round}
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-all duration-300",
              round < currentRound && "bg-[#ffd700] shadow-[0_0_8px_rgba(255,215,0,0.53)]",
              round === currentRound && "bg-[#ff2d95] shadow-[0_0_8px_rgba(255,45,149,0.53)]",
              round > currentRound && "bg-white/15",
            )}
          />
        );
      })}
    </div>
  );
}
