import type { Category, CategoryId } from "@/types/songs";
import categorySongs from "./category-songs.json";

export const CATEGORIES: Record<CategoryId, Category> = {
  us: {
    id: "us",
    label: "USA",
    flag: "\u{1F1FA}\u{1F1F8}",
    localePrefixes: ["en-US", "en-CA"],
  },
  uk: {
    id: "uk",
    label: "UK & Ireland",
    flag: "\u{1F1EC}\u{1F1E7}",
    localePrefixes: ["en-GB", "en-IE", "en-AU", "en-NZ"],
  },
  latin: {
    id: "latin",
    label: "Latin",
    flag: "\u{1F30E}",
    localePrefixes: ["es", "pt"],
  },
  kpop: {
    id: "kpop",
    label: "K-Pop",
    flag: "\u{1F1F0}\u{1F1F7}",
    localePrefixes: ["ko"],
  },
  bollywood: {
    id: "bollywood",
    label: "Bollywood",
    flag: "\u{1F1EE}\u{1F1F3}",
    localePrefixes: ["hi", "bn", "ta", "te", "mr", "gu", "kn", "ml"],
  },
  global: {
    id: "global",
    label: "Global Hits",
    flag: "\u{1F30D}",
    localePrefixes: [],
  },
  classics: {
    id: "classics",
    label: "Classics",
    flag: "\u{1F3B5}",
    localePrefixes: [],
  },
  kids: {
    id: "kids",
    label: "Kids",
    flag: "\u{1F9D2}",
    localePrefixes: [],
  },
};

export const CATEGORY_IDS = Object.keys(CATEGORIES) as CategoryId[];

/** Song IDs per category. Cross-category songs share catalog entries. */
export const CATEGORY_SONGS: Record<CategoryId, string[]> =
  categorySongs as Record<CategoryId, string[]>;
