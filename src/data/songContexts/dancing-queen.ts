import type { SongContext } from "@/types/songContext";

const context: SongContext = {
  songId: "dancing-queen",
  version: 1,
  meta: {
    bpm: 101,
    keySignature: "A major",
    timeSignature: "4/4",
    vocalRangeLowHz: 220.0, // A3
    vocalRangeHighHz: 587.3, // D5
  },
  sections: [
    { type: "intro",        startMs: 0,      endMs: 22000,  label: "Piano Intro",      isSinging: false, intensity: "soft"   },
    { type: "verse",        startMs: 22000,  endMs: 55000,  label: "Verse 1",           isSinging: true,  intensity: "medium" },
    { type: "pre-chorus",   startMs: 55000,  endMs: 75000,  label: "Pre-Chorus",        isSinging: true,  intensity: "loud"   },
    { type: "chorus",       startMs: 75000,  endMs: 110000, label: "Chorus",            isSinging: true,  intensity: "belt"   },
    { type: "verse",        startMs: 110000, endMs: 150000, label: "Verse 2",           isSinging: true,  intensity: "medium" },
    { type: "chorus",       startMs: 150000, endMs: 190000, label: "Chorus 2",          isSinging: true,  intensity: "belt"   },
    { type: "instrumental", startMs: 190000, endMs: 215000, label: "Instrumental",      isSinging: false, intensity: "soft"   },
    { type: "chorus",       startMs: 215000, endMs: 235000, label: "Final Chorus",      isSinging: true,  intensity: "belt"   },
  ],
  pitchPhrases: [
    {
      startMs: 22000,
      endMs: 55000,
      notes: [
        { timeMs: 22000, frequency: 329.6, durationMs: 600,  semitone: -10, syllable: "You" },
        { timeMs: 22600, frequency: 349.2, durationMs: 600,  semitone: -9,  syllable: "can" },
        { timeMs: 23200, frequency: 392.0, durationMs: 600,  semitone: -6,  syllable: "dance" },
        { timeMs: 24000, frequency: 440.0, durationMs: 800,  semitone: 0,   syllable: "you" },
        { timeMs: 24800, frequency: 392.0, durationMs: 600,  semitone: -6,  syllable: "can" },
        { timeMs: 25400, frequency: 349.2, durationMs: 2000, semitone: -9,  syllable: "jive" },
        { timeMs: 29000, frequency: 329.6, durationMs: 600,  semitone: -10, syllable: "hav-" },
        { timeMs: 29600, frequency: 349.2, durationMs: 600,  semitone: -9,  syllable: "ing" },
        { timeMs: 30200, frequency: 392.0, durationMs: 600,  semitone: -6,  syllable: "the" },
        { timeMs: 30800, frequency: 440.0, durationMs: 800,  semitone: 0,   syllable: "time" },
        { timeMs: 31600, frequency: 392.0, durationMs: 500,  semitone: -6,  syllable: "of" },
        { timeMs: 32100, frequency: 349.2, durationMs: 2000, semitone: -9,  syllable: "your" },
        { timeMs: 34100, frequency: 329.6, durationMs: 2000, semitone: -10, syllable: "life" },
      ],
    },
    {
      startMs: 75000,
      endMs: 110000,
      notes: [
        { timeMs: 75000,  frequency: 440.0, durationMs: 400,  semitone: 0,  syllable: "You" },
        { timeMs: 75400,  frequency: 493.9, durationMs: 400,  semitone: 2,  syllable: "are" },
        { timeMs: 75800,  frequency: 523.3, durationMs: 400,  semitone: 3,  syllable: "the" },
        { timeMs: 76200,  frequency: 587.3, durationMs: 800,  semitone: 5,  syllable: "danc-" },
        { timeMs: 77000,  frequency: 523.3, durationMs: 500,  semitone: 3,  syllable: "ing" },
        { timeMs: 77500,  frequency: 493.9, durationMs: 2000, semitone: 2,  syllable: "queen" },
        { timeMs: 81000,  frequency: 440.0, durationMs: 400,  semitone: 0,  syllable: "young" },
        { timeMs: 81400,  frequency: 493.9, durationMs: 400,  semitone: 2,  syllable: "and" },
        { timeMs: 81800,  frequency: 523.3, durationMs: 400,  semitone: 3,  syllable: "sweet" },
        { timeMs: 82200,  frequency: 587.3, durationMs: 800,  semitone: 5,  syllable: "on-" },
        { timeMs: 83000,  frequency: 523.3, durationMs: 500,  semitone: 3,  syllable: "ly" },
        { timeMs: 83500,  frequency: 440.0, durationMs: 2000, semitone: 0,  syllable: "sev-" },
        { timeMs: 85500,  frequency: 392.0, durationMs: 3000, semitone: -6, syllable: "en-" },
        { timeMs: 88500,  frequency: 349.2, durationMs: 2000, semitone: -9, syllable: "teen" },
      ],
    },
  ],
  coachingCues: [
    { timestampMs: 0,      message: "Piano intro... get in the mood!",         type: "intro"  },
    { timestampMs: 22000,  message: "You can dance, you can jive!",             type: "verse"  },
    { timestampMs: 40000,  message: "Friday night and the lights are low",      type: "verse"  },
    { timestampMs: 55000,  message: "Looking out for a place to go...",         type: "verse"  },
    { timestampMs: 75000,  message: "You are the DANCING QUEEN!",               type: "chorus" },
    { timestampMs: 95000,  message: "Feel the beat of the tambourine!",         type: "chorus" },
    { timestampMs: 120000, message: "Keep dancing! 💃",                          type: "hype"   },
    { timestampMs: 150000, message: "You are the dancing queen!",               type: "chorus" },
    { timestampMs: 190000, message: "Instrumental — take a breather!",          type: "instrumental" },
    { timestampMs: 215000, message: "One more time! Give it all! 🌟",           type: "hype"   },
  ],
};

export default context;
