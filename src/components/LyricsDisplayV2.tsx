import { useRef, useEffect } from "react";
import type { Line } from "@/types/songs";
import { useVisualizer } from "@/features/audio/useVisualizer";

interface LyricsDisplayV2Props {
  prevLine: Line | null;
  activeLine: Line | null;
  nextLine: Line | null;
  activeSyllableIdx: number;
  activeLineHasGolden: boolean;
  freqArray?: React.MutableRefObject<Uint8Array>;
  isActive?: boolean;
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
  const allRap = line.notes.every(
    (n) => n.type === "rap" || n.type === "freestyle",
  );

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
            <span className={`transition-colors duration-100 ${color}`}>
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
}

function InlineVisualizer({
  freqArray,
  isActive,
}: {
  freqArray: React.MutableRefObject<Uint8Array>;
  isActive: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { draw } = useVisualizer();
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio ?? 1;
      const cssW = parent.clientWidth;
      const cssH = parent.clientHeight;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
    };

    resizeCanvas();
    const ro = new ResizeObserver(resizeCanvas);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    if (!isActive) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      return () => ro.disconnect();
    }

    const loop = () => {
      if (canvas && freqArray.current.length > 0) {
        draw(canvas, freqArray.current);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [isActive, freqArray, draw]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
    />
  );
}

export function LyricsDisplayV2({
  prevLine,
  activeLine,
  nextLine,
  activeSyllableIdx,
  activeLineHasGolden,
  freqArray,
  isActive = false,
}: LyricsDisplayV2Props) {
  if (!prevLine && !activeLine && !nextLine) return null;

  const borderColor =
    activeLineHasGolden && activeLine
      ? "border-[#ffd700]/40"
      : "border-white/[0.06]";

  return (
    <div
      className={`
        w-full max-w-2xl rounded-2xl px-6 py-6 text-center
        bg-white/[0.04] border transition-colors duration-300
        relative overflow-hidden
        ${borderColor}
      `}
    >
      {freqArray && (
        <InlineVisualizer freqArray={freqArray} isActive={isActive} />
      )}

      <div className="relative z-10 flex flex-col gap-2">
        {/* Previous line */}
        <div className="min-h-[1.5rem] text-sm md:text-base text-white/20 transition-opacity duration-300 truncate">
          {prevLine ? lineText(prevLine) : "\u00A0"}
        </div>

        {/* Active line */}
        <div className="min-h-[2rem] text-lg md:text-xl font-bold transition-opacity duration-300 leading-relaxed">
          {activeLine ? (
            <ActiveLine line={activeLine} idx={activeSyllableIdx} />
          ) : "\u00A0"}
        </div>

        {/* Next line */}
        <div className="min-h-[1.5rem] text-sm md:text-base text-white/35 transition-opacity duration-300 truncate">
          {nextLine ? lineText(nextLine) : "\u00A0"}
        </div>
      </div>
    </div>
  );
}
