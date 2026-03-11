// ── Song Difficulty ──────────────────────────────────────────────────────────

export type SongDifficulty = "easy" | "medium" | "hard" | "expert";

// ── Play Mode ───────────────────────────────────────────────────────────────

export type PlayMode = "curated" | "freeform";

// ── Region ──────────────────────────────────────────────────────────────────

export type RegionId =
  | "us"
  | "uk"
  | "latin"
  | "kpop"
  | "bollywood"
  | "global"
  | "classics";

export interface Region {
  id: RegionId;
  label: string;
  flag: string;
  localePrefixes: string[];
}

// ── Coaching ────────────────────────────────────────────────────────────────

export type CoachingCueType = "intro" | "verse" | "chorus" | "instrumental" | "hype";

export interface CoachingCue {
  timestampMs: number;
  message: string;
  type: CoachingCueType;
}

// ── Curated Song ────────────────────────────────────────────────────────────

export interface CuratedSong {
  id: string;
  title: string;
  artist: string;
  year: number;
  genre: string;
  difficulty: SongDifficulty;
  spotifyUri: string;
  durationMs: number;
}
