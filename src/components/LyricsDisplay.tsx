import type { Line } from "@/types/songs";

interface LyricsDisplayProps {
  prevLine: Line | null;
  activeLine: Line | null;
  nextLine: Line | null;
  activeSyllableIdx: number;
  activeLineHasGolden: boolean;
}

function lineToText(line: Line): string {
  return line.notes
    .map((n, i) => {
      const isContinuation = n.syllable.startsWith("~");
      const text = n.syllable.replace(/~/g, "");
      return i === 0 || isContinuation ? text : " " + text;
    })
    .join("");
}

interface ActiveLineProps {
  line: Line;
  activeSyllableIdx: number;
}

function ActiveLineText({ line, activeSyllableIdx }: ActiveLineProps) {
  const isAllRap = line.notes.every((n) => n.type === "rap" || n.type === "freestyle");

  return (
    <span>
      {line.notes.map((note, i) => {
        const isContinuation = note.syllable.startsWith("~");
        const text = note.syllable.replace(/~/g, "");
        const spacer = i > 0 && !isContinuation ? " " : "";

        let colorClass: string;
        if (i === activeSyllableIdx) {
          if (note.type === "golden") {
            colorClass = "neon-gold";
          } else if (note.type === "rap" || note.type === "freestyle") {
            colorClass = "text-white/60";
          } else {
            colorClass = "neon-cyan";
          }
        } else if (i < activeSyllableIdx) {
          colorClass = "text-white/50";
        } else {
          colorClass = "text-white/35";
        }

        return (
          <span key={i}>
            {spacer}
            <span className={`transition-colors duration-100 ${colorClass}`}>{text}</span>
          </span>
        );
      })}
      {isAllRap && (
        <span className="ml-2 text-[10px] uppercase tracking-[2px] text-white/40 border border-white/20 rounded px-1 align-middle">
          rap
        </span>
      )}
    </span>
  );
}

export function LyricsDisplay({
  prevLine,
  activeLine,
  nextLine,
  activeSyllableIdx,
  activeLineHasGolden,
}: LyricsDisplayProps) {
  const containerClass = [
    "w-full max-w-[600px] rounded-2xl px-4 py-2.5 text-center",
    "bg-white/[0.06] border transition-colors duration-300",
    activeLineHasGolden && activeLine ? "border-[#ffd700]/40" : "border-white/[0.08]",
  ].join(" ");

  return (
    <div className={containerClass}>
      {/* Previous line */}
      <div
        key="prev"
        className="min-h-[1.5rem] text-sm text-white/25 transition-opacity duration-300 truncate"
      >
        {prevLine ? lineToText(prevLine) : null}
      </div>

      {/* Active line */}
      <div
        key="active"
        className="min-h-[1.75rem] text-base font-bold transition-opacity duration-300"
      >
        {activeLine ? (
          <ActiveLineText line={activeLine} activeSyllableIdx={activeSyllableIdx} />
        ) : null}
      </div>

      {/* Next line */}
      <div
        key="next"
        className="min-h-[1.5rem] text-sm text-white/45 transition-opacity duration-300 truncate"
      >
        {nextLine ? lineToText(nextLine) : null}
      </div>
    </div>
  );
}
