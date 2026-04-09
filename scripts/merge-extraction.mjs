#!/usr/bin/env node
/**
 * Merges music-metadata-extractor results into the main repo.
 *
 * Usage: node scripts/merge-extraction.mjs <results-dir>
 *
 * What it does:
 *  1. Merges catalog-additions.json into src/data/songs/catalog.json
 *  2. Merges category-suggestions.json into src/data/songs/category-songs.json
 *  3. Copies song-data/*.json to public/song-data/
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const CATALOG_PATH = path.join(ROOT, "src/data/songs/catalog.json");
const CATEGORIES_PATH = path.join(ROOT, "src/data/songs/category-songs.json");
const SONG_DATA_DIR = path.join(ROOT, "public/song-data");

function main() {
  const resultsDir = process.argv[2];

  if (!resultsDir) {
    console.error("Usage: node scripts/merge-extraction.mjs <results-dir>");
    console.error(
      "Example: node scripts/merge-extraction.mjs ../music-metadata-extractor/results/2026-04-09T...",
    );
    process.exit(1);
  }

  const absResultsDir = path.resolve(resultsDir);

  if (!fs.existsSync(absResultsDir)) {
    console.error(`Results directory not found: ${absResultsDir}`);
    process.exit(1);
  }

  // 1. Merge catalog additions
  const additionsPath = path.join(absResultsDir, "catalog-additions.json");
  if (fs.existsSync(additionsPath)) {
    const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf-8"));
    const additions = JSON.parse(fs.readFileSync(additionsPath, "utf-8"));

    let added = 0;
    let skipped = 0;
    for (const [id, song] of Object.entries(additions)) {
      if (catalog[id]) {
        console.log(`  SKIP catalog (exists): ${id}`);
        skipped++;
      } else {
        catalog[id] = song;
        added++;
      }
    }

    fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2) + "\n");
    console.log(`Catalog: +${added} songs (${skipped} skipped)`);
  }

  // 2. Merge category suggestions
  const categoriesPath = path.join(absResultsDir, "category-suggestions.json");
  if (fs.existsSync(categoriesPath)) {
    const existing = JSON.parse(fs.readFileSync(CATEGORIES_PATH, "utf-8"));
    const suggestions = JSON.parse(fs.readFileSync(categoriesPath, "utf-8"));

    let totalAdded = 0;
    for (const [category, songIds] of Object.entries(suggestions)) {
      if (!existing[category]) existing[category] = [];
      const existingSet = new Set(existing[category]);
      for (const id of /** @type {string[]} */ (songIds)) {
        if (!existingSet.has(id)) {
          existing[category].push(id);
          totalAdded++;
        }
      }
    }

    fs.writeFileSync(
      CATEGORIES_PATH,
      JSON.stringify(existing, null, 2) + "\n",
    );
    console.log(`Categories: +${totalAdded} assignments`);
  }

  // 3. Copy song-data JSON files
  const songDataSrc = path.join(absResultsDir, "song-data");
  if (fs.existsSync(songDataSrc)) {
    const files = fs.readdirSync(songDataSrc).filter((f) => f.endsWith(".json"));
    let copied = 0;

    for (const file of files) {
      const dest = path.join(SONG_DATA_DIR, file);
      if (fs.existsSync(dest)) {
        console.log(`  SKIP song-data (exists): ${file}`);
        continue;
      }
      fs.copyFileSync(path.join(songDataSrc, file), dest);
      copied++;
    }

    console.log(`Song data: ${copied} files copied to public/song-data/`);
  }

  console.log("\nDone! Review changes with 'git diff' then commit.");
}

main();
