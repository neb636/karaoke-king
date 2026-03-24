import { useState, useEffect, useRef } from "react";
import type { CoachingCue } from "@/types/songs";
import type { SongContext } from "@/types/songContext";
import { getSectionAt } from "@/types/songContext";
import { COACHING_DATA } from "@/data/coaching";

const CUE_DISPLAY_MS = 3000;
const MIN_GAP_MS = 5000;

/**
 * Returns an automatic coaching cue when the singer crosses a section boundary
 * that warrants one (e.g. entering an instrumental, hitting a belt section).
 * Returns null when no automatic prompt is needed.
 */
function buildSectionCue(
  context: SongContext,
  positionMs: number,
  prevPositionMs: number,
): CoachingCue | null {
  const current = getSectionAt(context.sections, positionMs);
  const prev = getSectionAt(context.sections, prevPositionMs);

  // Only fire when we cross into a new section
  if (!current || current === prev) return null;

  if (!current.isSinging) {
    const label = current.label ? ` (${current.label})` : "";
    switch (current.type) {
      case "instrumental":
        return { timestampMs: positionMs, message: `🎸 Instrumental${label} — take a breath!`, type: "instrumental" };
      case "intro":
        return { timestampMs: positionMs, message: "🎵 Intro — get ready to sing!", type: "intro" };
      case "outro":
        return { timestampMs: positionMs, message: "🎵 Outro — almost done!", type: "instrumental" };
      default:
        return null;
    }
  }

  // Singing section — prompt based on intensity
  switch (current.intensity) {
    case "belt":
      return { timestampMs: positionMs, message: "🔥 BELT IT OUT!", type: "hype" };
    case "loud":
      return { timestampMs: positionMs, message: "📢 Sing louder!", type: "hype" };
    case "medium":
      return null; // No need to prompt medium sections explicitly
    case "soft":
      return { timestampMs: positionMs, message: "🎤 Soft and easy...", type: "verse" };
    default:
      return null;
  }
}

export function useCoachingCues(
  songId: string | null,
  currentPositionMs: number,
  /** Optional rich context. When provided, coaching cues come from context.coachingCues
   *  and section-crossing auto-cues are generated. Falls back to legacy COACHING_DATA
   *  when context is null/undefined. */
  context?: SongContext | null,
) {
  const [currentCue, setCurrentCue] = useState<CoachingCue | null>(null);
  const lastCueTimeRef = useRef(0);
  const pointerRef = useRef(0);
  const prevPositionRef = useRef(0);

  // Resolve the cue list: prefer context.coachingCues, fall back to COACHING_DATA
  const cues: CoachingCue[] | null = (() => {
    if (context) return context.coachingCues;
    if (songId) return COACHING_DATA[songId] ?? null;
    return null;
  })();

  useEffect(() => {
    // Reset when song changes
    pointerRef.current = 0;
    lastCueTimeRef.current = 0;
    prevPositionRef.current = 0;
    setCurrentCue(null);
  }, [songId]);

  useEffect(() => {
    const now = Date.now();
    const canShowCue = now - lastCueTimeRef.current >= MIN_GAP_MS || lastCueTimeRef.current === 0;

    // ── Timestamped coaching cues ─────────────────────────────────────────────
    if (cues && cues.length > 0) {
      const pointer = pointerRef.current;
      if (pointer < cues.length) {
        const nextCue = cues[pointer]!;

        if (currentPositionMs >= nextCue.timestampMs) {
          if (canShowCue) {
            setCurrentCue(nextCue);
            lastCueTimeRef.current = now;
            pointerRef.current = pointer + 1;

            const timeout = setTimeout(() => {
              setCurrentCue(null);
            }, CUE_DISPLAY_MS);

            prevPositionRef.current = currentPositionMs;
            return () => clearTimeout(timeout);
          } else {
            // Skip this cue — too close to the last one
            pointerRef.current = pointer + 1;
          }
        }
      }
    }

    // ── Section-crossing auto-cues (only when we have a rich context) ─────────
    if (context && canShowCue) {
      const autoCue = buildSectionCue(context, currentPositionMs, prevPositionRef.current);
      if (autoCue) {
        setCurrentCue(autoCue);
        lastCueTimeRef.current = now;

        const timeout = setTimeout(() => {
          setCurrentCue(null);
        }, CUE_DISPLAY_MS);

        prevPositionRef.current = currentPositionMs;
        return () => clearTimeout(timeout);
      }
    }

    prevPositionRef.current = currentPositionMs;
  }, [cues, context, currentPositionMs]);

  return { currentCue };
}
