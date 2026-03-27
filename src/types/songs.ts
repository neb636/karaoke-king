
// extract

/** `:` = normal, `*` = golden (bonus points), `R` = rap/freestyle, `F` = freestyle */
export type NoteType = 'normal' | 'golden' | 'rap' | 'freestyle';

export interface Note {
  type: NoteType;
  beat: number;       // start beat (relative to GAP offset)
  duration: number;   // length in beats
  pitch: number;      // relative MIDI pitch (can be negative)
  syllable: string;   // lyric syllable for this note
}

export interface Line {
  notes: Note[];
  /** Beat value from the `-` line separator; null if this is the last line */
  nextLineStartBeat: number | null;
}

export interface Track {
  /** null = single-player song; 'P1'/'P2' = duet tracks */
  player: 'P1' | 'P2' | null;
  lines: Line[];
}

// Video Metadata ─────────────────────────────────────────────────

export interface TrackVideo {
  youtubeId: string;
  coverImage: string | null;
  backgroundImage: string | null;
  /** Preview playback start in seconds */
  previewStartSeconds: number | null;
  /** Medley section start beat */
  medleyStartBeat: number | null;
  /** Medley section end beat */
  medleyEndBeat: number | null;
  /** Duet singer name for P1 (from `p1=` in VIDEO field) */
  duetSinger1: string | null;
  /** Duet singer name for P2 (from `p2=` in VIDEO field) */
  duetSinger2: string | null;
}

export interface DataFormat {
  // Header metadata
  artist: string;
  title: string;
  mp3Filename: string;
  creator: string | null;
  edition: string | null;
  genre: string | null;
  year: number | null;
  language: string | null;
  /** Beats per minute used for timing all note beat values */
  bpm: number;
  /** Milliseconds before the first note beat starts */
  gapMs: number;
  /** Optional offset (seconds) into the audio to start playback */
  startSeconds: number | null;
  video: TrackVideo | null;
  // Song structure
  isDuet: boolean;
  tracks: Track[];
}


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
  extractedData?: DataFormat | null;
}
