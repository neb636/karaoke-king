import { useMemo } from "react";
import type { DataFormat, Line } from "@/types/songs";
import { beatToMs } from "@/data/songs/songData";

interface LineWindow {
  line: Line;
  startMs: number;
  endMs: number;
  noteStartMs: number[];
}

export interface UseLyricsResult {
  prevLine: Line | null;
  activeLine: Line | null;
  nextLine: Line | null;
  activeSyllableIdx: number;
  activeLineHasGolden: boolean;
}

const NULL_RESULT: UseLyricsResult = {
  prevLine: null,
  activeLine: null,
  nextLine: null,
  activeSyllableIdx: -1,
  activeLineHasGolden: false,
};

function getLeadLines(data: DataFormat): Line[] {
  const track = data.isDuet
    ? data.tracks.find((t) => t.player === "P1")
    : data.tracks[0];
  return track?.lines ?? [];
}

export function useLyrics(
  extractedData: DataFormat | null,
  currentPositionMs: number,
): UseLyricsResult {
  const windows = useMemo<LineWindow[]>(() => {
    if (!extractedData) return [];
    const { bpm, gapMs, startSeconds } = extractedData;
    const audioOffsetMs = (startSeconds ?? 0) * 1000;
    const lines = getLeadLines(extractedData);

    return lines.map((line, i) => {
      const firstNote = line.notes[0]!;
      const lastNote = line.notes[line.notes.length - 1]!;
      const startMs = beatToMs(firstNote.beat, bpm, gapMs) + audioOffsetMs;

      // End: use nextLineStartBeat if available, otherwise last note's end
      const endMs =
        (line.nextLineStartBeat != null
          ? beatToMs(line.nextLineStartBeat, bpm, gapMs)
          : i + 1 < lines.length
            ? beatToMs(lines[i + 1]!.notes[0]!.beat, bpm, gapMs)
            : beatToMs(lastNote.beat + lastNote.duration, bpm, gapMs)) + audioOffsetMs;

      const noteStartMs = line.notes.map((n) => beatToMs(n.beat, bpm, gapMs) + audioOffsetMs);

      return { line, startMs, endMs, noteStartMs };
    });
  }, [extractedData]);

  if (!extractedData || windows.length === 0) return NULL_RESULT;

  // Find active window
  const activeIdx = windows.findIndex(
    (w) => currentPositionMs >= w.startMs && currentPositionMs < w.endMs,
  );

  // If between lines, find where we are
  let resolvedActiveIdx = activeIdx;
  if (activeIdx === -1) {
    // Use the last window whose endMs has passed as "prev" reference
    resolvedActiveIdx = -1;
  }

  const activeWindow = resolvedActiveIdx >= 0 ? windows[resolvedActiveIdx]! : null;
  const activeLine = activeWindow?.line ?? null;

  // For prev/next when not in an active line, find surrounding windows
  let prevLine: Line | null = null;
  let nextLine: Line | null = null;

  if (activeWindow) {
    prevLine = resolvedActiveIdx > 0 ? windows[resolvedActiveIdx - 1]!.line : null;
    nextLine =
      resolvedActiveIdx < windows.length - 1
        ? windows[resolvedActiveIdx + 1]!.line
        : null;
  } else {
    // In a gap — find the last line that ended before now and the next that starts after
    let lastEndedIdx = -1;
    for (let i = 0; i < windows.length; i++) {
      if (windows[i]!.endMs <= currentPositionMs) {
        lastEndedIdx = i;
      }
    }
    prevLine = lastEndedIdx >= 0 ? windows[lastEndedIdx]!.line : null;
    const nextIdx = lastEndedIdx + 1;
    nextLine = nextIdx < windows.length ? windows[nextIdx]!.line : null;
  }

  // Find active syllable — last note that has started
  let activeSyllableIdx = -1;
  if (activeWindow) {
    for (let i = activeWindow.noteStartMs.length - 1; i >= 0; i--) {
      if (currentPositionMs >= activeWindow.noteStartMs[i]!) {
        activeSyllableIdx = i;
        break;
      }
    }
  }

  const activeLineHasGolden =
    activeLine?.notes.some((n) => n.type === "golden") ?? false;

  return { prevLine, activeLine, nextLine, activeSyllableIdx, activeLineHasGolden };
}
