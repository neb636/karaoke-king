import type { CategoryId } from "@/types/songs";
import { CATEGORIES, CATEGORY_IDS } from "@/data/songs/categories";

/**
 * Detect the best category based on the user's browser locale.
 * Falls back to "us" if no match found.
 */
export function detectCategory(): CategoryId {
  const locale = navigator.language ?? "";
  const lower = locale.toLowerCase();

  for (const categoryId of CATEGORY_IDS) {
    const category = CATEGORIES[categoryId];
    for (const prefix of category.localePrefixes) {
      if (lower.startsWith(prefix.toLowerCase())) {
        return categoryId;
      }
    }
  }

  // Default to US for generic English or unknown locales
  return "us";
}
