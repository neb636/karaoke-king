import type { CoachingCue, DataFormat } from "@/types/songs";
import { beatToMs } from "@/data/songs/songData";

/**
 * Runtime fallback: derives coaching cues from a song's note data.
 * Used only for songs that don't have pre-generated coachingCues
 * in their JSON file. New songs should have cues generated via
 * the mastering tool or `npm run generate-coaching`.
 */
export function generateCoachingCues(data: DataFormat): CoachingCue[] {
  const { bpm, gapMs, startSeconds } = data;
  const track = data.isDuet ? data.tracks.find((t) => t.player === "P1") : data.tracks[0];
  const lines = track?.lines ?? [];
  if (lines.length === 0) return [];

  const cues: CoachingCue[] = [];
  const playbackStartMs = (startSeconds ?? 0) * 1000;

  const firstNoteMs = beatToMs(lines[0]!.notes[0]!.beat, bpm, gapMs);
  if (firstNoteMs - playbackStartMs > 3000) {
    cues.push({ timestampMs: playbackStartMs, message: "Get ready to sing!", type: "intro" });
  }

  for (let i = 0; i < lines.length - 1; i++) {
    const line = lines[i]!;
    const nextLine = lines[i + 1]!;
    const lastNote = line.notes[line.notes.length - 1]!;
    const lineEndMs = beatToMs(lastNote.beat + lastNote.duration, bpm, gapMs);
    const nextStartMs = beatToMs(nextLine.notes[0]!.beat, bpm, gapMs);
    const gapDuration = nextStartMs - lineEndMs;

    if (gapDuration > 8000) {
      cues.push({
        timestampMs: lineEndMs + 500,
        message: "Instrumental break — catch your breath!",
        type: "instrumental",
      });
    } else if (gapDuration > 4000) {
      cues.push({
        timestampMs: lineEndMs + 500,
        message: "Catch your breath!",
        type: "instrumental",
      });
    }

    const warningMs = nextStartMs - 3000;
    if (gapDuration > 6000 && warningMs > lineEndMs + 1500) {
      const preview = nextLine.notes
        .filter((n) => !n.syllable.startsWith("~"))
        .slice(0, 3)
        .map((n) => n.syllable.replace(/~/g, "").trim())
        .join(" ");
      if (preview) {
        cues.push({ timestampMs: warningMs, message: `${preview}...`, type: "verse" });
      }
    }

    if (nextLine.notes.some((n) => n.type === "golden")) {
      const goldenWarningMs = nextStartMs - 2000;
      if (goldenWarningMs >= lineEndMs) {
        cues.push({
          timestampMs: goldenWarningMs,
          message: "Golden notes — hold it!",
          type: "hype",
        });
      }
    }
  }

  for (const line of lines) {
    if (line.notes.every((n) => n.type === "rap" || n.type === "freestyle")) {
      cues.push({
        timestampMs: beatToMs(line.notes[0]!.beat, bpm, gapMs),
        message: "Rap section!",
        type: "verse",
      });
    }
  }

  cues.sort((a, b) => a.timestampMs - b.timestampMs);
  const deduped: CoachingCue[] = [];
  for (const cue of cues) {
    const last = deduped[deduped.length - 1];
    if (!last || cue.timestampMs - last.timestampMs >= 1500) {
      deduped.push(cue);
    }
  }
  return deduped;
}
