import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface FeedbackToastProps {
  message: string;
  colorClass: string;
}

export function FeedbackToast({ message, colorClass }: FeedbackToastProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const prevMessage = useRef(message);

  useEffect(() => {
    if (message && message !== prevMessage.current && spanRef.current) {
      // Retrigger animation by toggling a class
      spanRef.current.classList.remove("animate-feedback-pop");
      void spanRef.current.offsetWidth; // reflow
      spanRef.current.classList.add("animate-feedback-pop");
    }
    prevMessage.current = message;
  }, [message]);

  return (
    <div className="h-12 flex items-center justify-center">
      <span
        ref={spanRef}
        className={cn(
          "font-display text-2xl tracking-widest whitespace-nowrap animate-feedback-pop",
          colorClass,
        )}
      >
        {message}
      </span>
    </div>
  );
}
