import { cn } from "@/lib/utils";
import type { CoachingCue, CoachingCueType } from "@/types/songs";

const typeStyles: Record<CoachingCueType, string> = {
  intro: "neon-cyan",
  verse: "text-white/70",
  chorus: "neon-gold",
  instrumental: "text-white/40",
  hype: "neon-pink",
};

interface CoachingPromptProps {
  cue: CoachingCue;
}

export function CoachingPrompt({ cue }: CoachingPromptProps) {
  return (
    <div
      key={cue.timestampMs}
      className={cn(
        "text-center py-2 px-4 my-2 rounded-xl",
        "animate-feedback-pop",
        "font-display text-lg tracking-wide",
        typeStyles[cue.type],
      )}
    >
      {cue.message}
    </div>
  );
}
