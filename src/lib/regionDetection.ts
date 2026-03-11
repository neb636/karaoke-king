import type { RegionId } from "@/types/songs";
import { REGIONS, REGION_IDS } from "@/data/songs/regions";

/**
 * Detect the best region based on the user's browser locale.
 * Falls back to "us" if no match found.
 */
export function detectRegion(): RegionId {
  const locale = navigator.language ?? "";
  const lower = locale.toLowerCase();

  for (const regionId of REGION_IDS) {
    const region = REGIONS[regionId];
    for (const prefix of region.localePrefixes) {
      if (lower.startsWith(prefix.toLowerCase())) {
        return regionId;
      }
    }
  }

  // Default to US for generic English or unknown locales
  return "us";
}
