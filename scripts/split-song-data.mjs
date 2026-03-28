import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const INPUT = resolve(ROOT, "src/data/song-data.json");
const OUTPUT_DIR = resolve(ROOT, "public/song-data");

const rawData = JSON.parse(readFileSync(INPUT, "utf-8"));
mkdirSync(OUTPUT_DIR, { recursive: true });

let written = 0, skipped = 0;
for (const [songId, entry] of Object.entries(rawData)) {
  if (entry.extractedData == null) { skipped++; continue; }
  writeFileSync(resolve(OUTPUT_DIR, `${songId}.json`), JSON.stringify(entry.extractedData));
  written++;
}
console.log(`split-song-data: wrote ${written} files, skipped ${skipped} null entries`);
