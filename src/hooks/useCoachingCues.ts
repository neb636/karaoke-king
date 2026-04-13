import { useState, useEffect, useRef, useMemo } from "react";
import type { CoachingCue, DataFormat } from "@/types/songs";
import { generateCoachingCues } from "@/data/coaching";

const CUE_DISPLAY_MS = 3000;
const MIN_GAP_MS = 5000;

export function useCoachingCues(
  songId: string | null,
  currentPositionMs: number,
  extractedData?: DataFormat | null
) {
  const [currentCue, setCurrentCue] = useState<CoachingCue | null>(null);
  const lastCueTimeRef = useRef(0);
  const pointerRef = useRef(0);

  const cues = useMemo<CoachingCue[] | null>(() => {
    if (!extractedData) return null;
    // Prefer pre-generated cues baked into the song JSON
    if (extractedData.coachingCues && extractedData.coachingCues.length > 0) {
      return extractedData.coachingCues;
    }
    // Fallback: generate at runtime from note data
    return generateCoachingCues(extractedData);
  }, [extractedData]);

  useEffect(() => {
    // Reset when song changes
    pointerRef.current = 0;
    lastCueTimeRef.current = 0;
    setCurrentCue(null);
  }, [songId]);

  useEffect(() => {
    if (!cues || cues.length === 0) return;

    const pointer = pointerRef.current;
    if (pointer >= cues.length) return;

    const nextCue = cues[pointer]!;

    // Check if we've passed the next cue's timestamp
    if (currentPositionMs >= nextCue.timestampMs) {
      const now = Date.now();
      // Enforce minimum gap between cues
      if (now - lastCueTimeRef.current >= MIN_GAP_MS || lastCueTimeRef.current === 0) {
        setCurrentCue(nextCue);
        lastCueTimeRef.current = now;
        pointerRef.current = pointer + 1;

        // Clear cue after display duration
        const timeout = setTimeout(() => {
          setCurrentCue(null);
        }, CUE_DISPLAY_MS);

        return () => clearTimeout(timeout);
      } else {
        // Skip this cue if too close to the last one
        pointerRef.current = pointer + 1;
      }
    }
  }, [cues, currentPositionMs]);

  return { currentCue };
}
