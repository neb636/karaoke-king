import type { Line } from "@/types/songs";

/** Join note syllables into a plain-text string, respecting `~` continuations. */
export function lineToText(line: Line): string {
  return line.notes
    .map((n, i) => {
      const cont = n.syllable.startsWith("~");
      const text = n.syllable.replace(/~/g, "");
      return i === 0 || cont ? text : " " + text;
    })
    .join("");
}
