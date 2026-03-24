import type { SongContext } from "@/types/songContext";

const context: SongContext = {
  songId: "uptown-funk",
  version: 1,
  meta: {
    bpm: 115,
    keySignature: "Dm",
    timeSignature: "4/4",
    vocalRangeLowHz: 164.8, // E3
    vocalRangeHighHz: 523.3, // C5
  },
  sections: [
    { type: "intro",        startMs: 0,      endMs: 12000,  label: "Intro",              isSinging: true,  intensity: "medium" },
    { type: "verse",        startMs: 12000,  endMs: 40000,  label: "Verse 1",            isSinging: true,  intensity: "medium" },
    { type: "pre-chorus",   startMs: 40000,  endMs: 58000,  label: "Pre-Chorus",         isSinging: true,  intensity: "loud"   },
    { type: "chorus",       startMs: 58000,  endMs: 100000, label: "Chorus",             isSinging: true,  intensity: "belt"   },
    { type: "verse",        startMs: 100000, endMs: 125000, label: "Verse 2",            isSinging: true,  intensity: "medium" },
    { type: "pre-chorus",   startMs: 125000, endMs: 155000, label: "Pre-Chorus 2",       isSinging: true,  intensity: "loud"   },
    { type: "chorus",       startMs: 155000, endMs: 200000, label: "Chorus 2",           isSinging: true,  intensity: "belt"   },
    { type: "bridge",       startMs: 200000, endMs: 240000, label: "Before I Leave",     isSinging: true,  intensity: "loud"   },
    { type: "chorus",       startMs: 240000, endMs: 280000, label: "Final Chorus",       isSinging: true,  intensity: "belt"   },
  ],
  pitchPhrases: [
    {
      startMs: 12000,
      endMs: 40000,
      notes: [
        { timeMs: 12000, frequency: 293.7, durationMs: 400,  semitone: -5,  syllable: "Mi-" },
        { timeMs: 12400, frequency: 329.6, durationMs: 400,  semitone: -10, syllable: "chelle" },
        { timeMs: 12800, frequency: 349.2, durationMs: 400,  semitone: -9,  syllable: "Pfeif-" },
        { timeMs: 13200, frequency: 392.0, durationMs: 800,  semitone: -6,  syllable: "fer" },
        { timeMs: 14000, frequency: 349.2, durationMs: 400,  semitone: -9,  syllable: "that" },
        { timeMs: 14400, frequency: 329.6, durationMs: 400,  semitone: -10, syllable: "white" },
        { timeMs: 14800, frequency: 293.7, durationMs: 2500, semitone: -5,  syllable: "gold" },
        { timeMs: 19000, frequency: 293.7, durationMs: 400,  semitone: -5,  syllable: "I'm" },
        { timeMs: 19400, frequency: 329.6, durationMs: 400,  semitone: -10, syllable: "too" },
        { timeMs: 19800, frequency: 349.2, durationMs: 400,  semitone: -9,  syllable: "hot" },
        { timeMs: 20200, frequency: 392.0, durationMs: 600,  semitone: -6,  syllable: "hot" },
        { timeMs: 20800, frequency: 349.2, durationMs: 400,  semitone: -9,  syllable: "damn" },
      ],
    },
    {
      startMs: 58000,
      endMs: 100000,
      notes: [
        { timeMs: 58000, frequency: 349.2, durationMs: 400,  semitone: -9,  syllable: "Up-" },
        { timeMs: 58400, frequency: 392.0, durationMs: 400,  semitone: -6,  syllable: "town" },
        { timeMs: 58800, frequency: 440.0, durationMs: 400,  semitone: 0,   syllable: "funk" },
        { timeMs: 59200, frequency: 392.0, durationMs: 400,  semitone: -6,  syllable: "you" },
        { timeMs: 59600, frequency: 349.2, durationMs: 2000, semitone: -9,  syllable: "up" },
        { timeMs: 62500, frequency: 349.2, durationMs: 400,  semitone: -9,  syllable: "Up-" },
        { timeMs: 62900, frequency: 392.0, durationMs: 400,  semitone: -6,  syllable: "town" },
        { timeMs: 63300, frequency: 440.0, durationMs: 400,  semitone: 0,   syllable: "funk" },
        { timeMs: 63700, frequency: 392.0, durationMs: 400,  semitone: -6,  syllable: "you" },
        { timeMs: 64100, frequency: 349.2, durationMs: 3000, semitone: -9,  syllable: "up" },
      ],
    },
  ],
  coachingCues: [
    { timestampMs: 0,      message: "This hit, that ice cold!",               type: "intro"  },
    { timestampMs: 12000,  message: "Michelle Pfeiffer, that white gold!",    type: "verse"  },
    { timestampMs: 26000,  message: "I'm too hot! Hot damn!",                 type: "verse"  },
    { timestampMs: 40000,  message: "Don't believe me just watch!",           type: "hype"   },
    { timestampMs: 58000,  message: "UPTOWN FUNK YOU UP!",                    type: "chorus" },
    { timestampMs: 80000,  message: "Say my name you know who I am!",         type: "chorus" },
    { timestampMs: 120000, message: "Saturday night and we in the spot!",     type: "verse"  },
    { timestampMs: 155000, message: "Don't believe me just WATCH! 👀",        type: "hype"   },
    { timestampMs: 190000, message: "UPTOWN FUNK YOU UP!",                    type: "chorus" },
    { timestampMs: 240000, message: "Bring it home! 🔥",                      type: "hype"   },
  ],
};

export default context;
