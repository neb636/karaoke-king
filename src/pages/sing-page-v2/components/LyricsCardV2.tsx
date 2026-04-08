import { memo } from "react";
import type { Line } from "@/types/songs";

/* ── helpers ─────────────────────────────────────────────────────────── */

function lineText(line: Line): string {
  return line.notes
    .map((n, i) => {
      const cont = n.syllable.startsWith("~");
      const text = n.syllable.replace(/~/g, "");
      return i === 0 || cont ? text : " " + text;
    })
    .join("");
}

/* ── ActiveLine (inner, memoised separately) ─────────────────────────── */

interface ActiveLineProps {
  line: Line;
  idx: number;
}

const ActiveLine = memo(function ActiveLine({ line, idx }: ActiveLineProps) {
  const allRap = line.notes.every((n) => n.type === "rap" || n.type === "freestyle");

  return (
    <span>
      {line.notes.map((note, i) => {
        const cont = note.syllable.startsWith("~");
        const text = note.syllable.replace(/~/g, "");
        const spacer = i > 0 && !cont ? " " : "";

        let color: string;
        if (i === idx) {
          color =
            note.type === "golden"
              ? "text-[#ffd700]/70"
              : note.type === "rap" || note.type === "freestyle"
                ? "text-white/50"
                : "text-[#00e5ff]/70";
        } else if (i < idx) {
          color = "text-white/50";
        } else {
          color = "text-white/35";
        }

        return (
          <span key={i}>
            {spacer}
            <span className={`transition-colors duration-100 ${color}`}>{text}</span>
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
}

export const LyricsCardV2 = memo(function LyricsCardV2({
  prevLine,
  activeLine,
  nextLine,
  activeSyllableIdx,
  activeLineHasGolden,
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
        {prevLine ? lineText(prevLine) : "\u00A0"}
      </div>

      {/* Active line */}
      <div className="min-h-[2rem] text-[18px] sm:text-[20px] font-bold py-1">
        {activeLine ? <ActiveLine line={activeLine} idx={activeSyllableIdx} /> : "\u00A0"}
      </div>

      {/* Next line */}
      <div className="min-h-[1.4rem] text-[16px] text-white/30 truncate">
        {nextLine ? lineText(nextLine) : "\u00A0"}
      </div>
    </div>
  );
});
