import type { Line } from "@/types/songs";

interface LyricsDisplayV2Props {
  prevLine: Line | null;
  activeLine: Line | null;
  nextLine: Line | null;
  activeSyllableIdx: number;
  activeLineHasGolden: boolean;
}

/** Join note syllables into a plain-text string, respecting `~` continuations. */
function lineText(line: Line): string {
  return line.notes
    .map((n, i) => {
      const cont = n.syllable.startsWith("~");
      const text = n.syllable.replace(/~/g, "");
      return i === 0 || cont ? text : " " + text;
    })
    .join("");
}

/** Renders the active line with per-syllable highlighting. */
function ActiveLine({ line, idx }: { line: Line; idx: number }) {
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
              ? "neon-gold"
              : note.type === "rap" || note.type === "freestyle"
                ? "text-white/60"
                : "neon-cyan";
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
}

export function LyricsDisplayV2({
  prevLine,
  activeLine,
  nextLine,
  activeSyllableIdx,
  activeLineHasGolden,
}: LyricsDisplayV2Props) {
  // Don't render the container at all if there's nothing to show
  if (!prevLine && !activeLine && !nextLine) return null;

  const borderColor =
    activeLineHasGolden && activeLine ? "border-[#ffd700]/40" : "border-white/[0.08]";

  return (
    <div
      className={`w-full max-w-[600px] rounded-2xl px-4 py-2.5 text-center bg-white/[0.06] border transition-colors duration-300 ${borderColor}`}
    >
      {/* Previous line */}
      <div className="min-h-[1.5rem] text-sm text-white/25 transition-opacity duration-300 truncate">
        {prevLine ? lineText(prevLine) : null}
      </div>

      {/* Active line */}
      <div className="min-h-[1.75rem] text-base font-bold transition-opacity duration-300">
        {activeLine ? <ActiveLine line={activeLine} idx={activeSyllableIdx} /> : null}
      </div>

      {/* Next line */}
      <div className="min-h-[1.5rem] text-sm text-white/45 transition-opacity duration-300 truncate">
        {nextLine ? lineText(nextLine) : null}
      </div>
    </div>
  );
}
