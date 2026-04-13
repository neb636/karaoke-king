import { memo, useEffect, useRef } from "react";
import type { Line } from "@/types/songs";
import type { NoteGrade } from "@/hooks/useNoteScoring";
import { lineToText } from "@/lib/lyrics";

const gradeColor: Record<NoteGrade, string> = {
  perfect: "text-[#39ff14]",
  good: "text-[#00e5ff]",
  ok: "text-[#ffd700]/80",
  miss: "text-[#ff2d95]/60",
};

/* ── ActiveLine (inner, memoised separately) ─────────────────────────── */

interface ActiveLineProps {
  line: Line;
  idx: number;
  lastGrade: NoteGrade | null;
}

const ActiveLine = memo(function ActiveLine({ line, idx, lastGrade }: ActiveLineProps) {
  const allRap = line.notes.every((n) => n.type === "rap" || n.type === "freestyle");
  const gradeRef = useRef<HTMLSpanElement>(null);
  const prevIdx = useRef(-1);

  useEffect(() => {
    if (
      lastGrade &&
      lastGrade !== "miss" &&
      idx >= 0 &&
      idx !== prevIdx.current &&
      gradeRef.current
    ) {
      gradeRef.current.classList.remove("animate-note-grade");
      void gradeRef.current.offsetWidth;
      gradeRef.current.classList.add("animate-note-grade");
    }
    prevIdx.current = idx;
  }, [idx, lastGrade]);

  return (
    <span>
      {line.notes.map((note, i) => {
        const cont = note.syllable.startsWith("~");
        const text = note.syllable.replace(/~/g, "");
        const spacer = i > 0 && !cont ? " " : "";

        let color: string;
        if (i === idx) {
          if (lastGrade && lastGrade !== "miss") {
            color = gradeColor[lastGrade];
          } else if (note.type === "golden") {
            color = "text-[#ffd700]/70";
          } else if (note.type === "rap" || note.type === "freestyle") {
            color = "text-white/50";
          } else {
            color = "text-[#00e5ff]/70";
          }
        } else if (i < idx) {
          color = "text-white/50";
        } else {
          color = "text-white/35";
        }

        return (
          <span key={i}>
            {spacer}
            <span
              ref={i === idx ? gradeRef : undefined}
              className={`transition-colors duration-100 ${color}`}
            >
              {text}
            </span>
          </span>
        );
      })}
      {allRap && (
        <span className="ml-2 text-[10px] uppercase tracking-[2px] text-white/40 border border-white/20 rounded px-1 align-middle">
          rap
        </span>
      )}
    </span>
  );
});

/* ── LyricsCardV2 ────────────────────────────────────────────────────── */

interface LyricsCardV2Props {
  prevLine: Line | null;
  activeLine: Line | null;
  nextLine: Line | null;
  activeSyllableIdx: number;
  activeLineHasGolden: boolean;
  lastGrade?: NoteGrade | null;
}

export const LyricsCardV2 = memo(function LyricsCardV2({
  prevLine,
  activeLine,
  nextLine,
  activeSyllableIdx,
  activeLineHasGolden,
  lastGrade = null,
}: LyricsCardV2Props) {

  const borderColor =
    activeLineHasGolden && activeLine
      ? "border-[#ffd700]/30 shadow-[0_0_16px_rgba(255,215,0,0.06)]"
      : "border-white/[0.08]";

  return (
    <div
      className={`w-full rounded-2xl px-[19px] py-[14px] text-center bg-white/[0.04] border transition-colors duration-300 ${borderColor}`}
    >
      {/* Previous line */}
      <div className="min-h-[1.4rem] text-[16px] text-white/20 truncate">
        {prevLine ? lineToText(prevLine) : "\u00A0"}
      </div>

      {/* Active line */}
      <div className="min-h-[2rem] text-[18px] sm:text-[20px] font-bold py-1">
        {activeLine ? (
          <ActiveLine line={activeLine} idx={activeSyllableIdx} lastGrade={lastGrade} />
        ) : (
          "\u00A0"
        )}
      </div>

      {/* Next line */}
      <div className="min-h-[1.4rem] text-[16px] text-white/30 truncate">
        {nextLine ? lineToText(nextLine) : "\u00A0"}
      </div>
    </div>
  );
});
