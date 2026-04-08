import { memo, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { CoachingCue, CoachingCueType } from "@/types/songs";

const cueColors: Record<CoachingCueType, string> = {
  intro: "text-[#00e5ff] border-[#00e5ff]/25 bg-[#00e5ff]/[0.05]",
  verse: "text-white/70 border-white/12 bg-white/[0.03]",
  chorus: "text-[#ffd700] border-[#ffd700]/25 bg-[#ffd700]/[0.05]",
  instrumental: "text-white/40 border-white/10 bg-white/[0.02]",
  hype: "text-[#ff2d95] border-[#ff2d95]/25 bg-[#ff2d95]/[0.05]",
};

interface FeedbackFloatV2Props {
  coachingCue: CoachingCue | null;
  feedbackMessage: string;
  feedbackColor: string;
  showCoaching: boolean;
}

export const FeedbackFloatV2 = memo(function FeedbackFloatV2({
  coachingCue,
  feedbackMessage,
  feedbackColor,
  showCoaching,
}: FeedbackFloatV2Props) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const prevMsg = useRef("");

  // Re-trigger pop animation on feedback message change
  useEffect(() => {
    if (feedbackMessage && feedbackMessage !== prevMsg.current && spanRef.current) {
      spanRef.current.classList.remove("animate-feedback-pop");
      // Force reflow with void to suppress lint
      void spanRef.current.offsetWidth;
      spanRef.current.classList.add("animate-feedback-pop");
    }
    prevMsg.current = feedbackMessage;
  }, [feedbackMessage]);

  return (
    <div className="relative h-8 flex items-center justify-center shrink-0 overflow-visible">
      {showCoaching && coachingCue ? (
        <span
          key={coachingCue.timestampMs}
          className={cn(
            "absolute font-display text-sm sm:text-base tracking-wide",
            "rounded-full border px-3 py-0.5 backdrop-blur-sm",
            "animate-feedback-pop whitespace-nowrap",
            cueColors[coachingCue.type]
          )}
        >
          {coachingCue.message}
        </span>
      ) : feedbackMessage ? (
        <span
          ref={spanRef}
          className={cn(
            "absolute font-display text-lg sm:text-xl tracking-widest whitespace-nowrap",
            "animate-feedback-pop",
            feedbackColor
          )}
        >
          {feedbackMessage}
        </span>
      ) : null}
    </div>
  );
});
