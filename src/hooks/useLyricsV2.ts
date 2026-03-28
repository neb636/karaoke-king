import { useMemo } from "react";
import type { DataFormat, Line } from "@/types/songs";
import { beatToMs } from "@/data/songs/songData";

interface LineWindow {
  line: Line;
  lineIdx: number;
  startMs: number;
  endMs: number;
  noteStartMs: number[];
}

export interface UseLyricsV2Result {
  prevLine: Line | null;
  activeLine: Line | null;
  nextLine: Line | null;
  activeSyllableIdx: number;
  activeLineHasGolden: boolean;
}

const NULL_RESULT: UseLyricsV2Result = {
  prevLine: null,
  activeLine: null,
  nextLine: null,
  activeSyllableIdx: -1,
  activeLineHasGolden: false,
};

/** How many ms before a line starts to show it as the "next" preview */
const NEXT_LINE_LOOKAHEAD_MS = 3000;

function getLeadLines(data: DataFormat): Line[] {
  const track = data.isDuet
    ? data.tracks.find((t) => t.player === "P1")
    : data.tracks[0];
  return track?.lines ?? [];
}

export function useLyricsV2(
  extractedData: DataFormat | null,
  currentPositionMs: number,
): UseLyricsV2Result {
  const windows = useMemo<LineWindow[]>(() => {
    if (!extractedData) return [];
    const { bpm, gapMs } = extractedData;
    const lines = getLeadLines(extractedData);

    // NOTE: We intentionally do NOT add startSeconds as an offset here.
    // In UltraStar format, gapMs is already the absolute offset from the
    // beginning of the audio file to beat 0. Spotify plays from position 0
    // and reports absolute track position, so gapMs alone is correct.

    return lines.map((line, i) => {
      const firstNote = line.notes[0]!;
      const lastNote = line.notes[line.notes.length - 1]!;
      const startMs = beatToMs(firstNote.beat, bpm, gapMs);

      const endMs =
        line.nextLineStartBeat != null
          ? beatToMs(line.nextLineStartBeat, bpm, gapMs)
          : i + 1 < lines.length
            ? beatToMs(lines[i + 1]!.notes[0]!.beat, bpm, gapMs)
            : beatToMs(lastNote.beat + lastNote.duration, bpm, gapMs);

      const noteStartMs = line.notes.map((n) => beatToMs(n.beat, bpm, gapMs));

      return { line, lineIdx: i, startMs, endMs, noteStartMs };
    });
  }, [extractedData]);

  if (!extractedData || windows.length === 0) return NULL_RESULT;

  // --- Find the active line (the one currently being sung) ---
  let activeWindow: LineWindow | null = null;
  let activeIdx = -1;

  for (let i = 0; i < windows.length; i++) {
    const w = windows[i]!;
    if (currentPositionMs >= w.startMs && currentPositionMs < w.endMs) {
      activeWindow = w;
      activeIdx = i;
      break;
    }
  }

  // --- Determine prev / next lines ---
  let prevLine: Line | null = null;
  let nextLine: Line | null = null;

  if (activeWindow) {
    // We have an active line — prev is the one before, next is the one after
    prevLine = activeIdx > 0 ? windows[activeIdx - 1]!.line : null;
    nextLine =
      activeIdx < windows.length - 1 ? windows[activeIdx + 1]!.line : null;
  } else {
    // We're in a gap between lines (or before/after all lines).
    // Find the last line that ended before now.
    let lastEndedIdx = -1;
    for (let i = 0; i < windows.length; i++) {
      if (windows[i]!.endMs <= currentPositionMs) {
        lastEndedIdx = i;
      }
    }

    prevLine = lastEndedIdx >= 0 ? windows[lastEndedIdx]!.line : null;

    // Only show the next line if we're within the lookahead window.
    // This prevents showing the first lyrics line the instant playback starts.
    const candidateNextIdx = lastEndedIdx + 1;
    if (candidateNextIdx < windows.length) {
      const candidateNext = windows[candidateNextIdx]!;
      if (candidateNext.startMs - currentPositionMs <= NEXT_LINE_LOOKAHEAD_MS) {
        nextLine = candidateNext.line;
      }
    }
  }

  // --- Find the active syllable ---
  let activeSyllableIdx = -1;
  if (activeWindow) {
    for (let i = activeWindow.noteStartMs.length - 1; i >= 0; i--) {
      if (currentPositionMs >= activeWindow.noteStartMs[i]!) {
        activeSyllableIdx = i;
        break;
      }
    }
  }

  const activeLine = activeWindow?.line ?? null;
  const activeLineHasGolden =
    activeLine?.notes.some((n) => n.type === "golden") ?? false;

  return { prevLine, activeLine, nextLine, activeSyllableIdx, activeLineHasGolden };
}
