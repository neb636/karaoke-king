import type { SongContext } from "@/types/songContext";

const context: SongContext = {
  songId: "sweet-caroline",
  version: 1,
  meta: {
    bpm: 126,
    keySignature: "A major",
    timeSignature: "4/4",
    vocalRangeLowHz: 220.0, // A3
    vocalRangeHighHz: 523.3, // C5
  },
  sections: [
    { type: "intro",        startMs: 0,      endMs: 12000,  label: "Instrumental Intro", isSinging: false, intensity: "soft"   },
    { type: "verse",        startMs: 12000,  endMs: 48000,  label: "Verse 1",             isSinging: true,  intensity: "medium" },
    { type: "chorus",       startMs: 48000,  endMs: 75000,  label: "Chorus",              isSinging: true,  intensity: "belt"   },
    { type: "verse",        startMs: 75000,  endMs: 110000, label: "Verse 2",             isSinging: true,  intensity: "medium" },
    { type: "chorus",       startMs: 110000, endMs: 145000, label: "Chorus 2",            isSinging: true,  intensity: "belt"   },
    { type: "instrumental", startMs: 145000, endMs: 165000, label: "Instrumental Break",  isSinging: false, intensity: "soft"   },
    { type: "chorus",       startMs: 165000, endMs: 210000, label: "Final Chorus",        isSinging: true,  intensity: "belt"   },
  ],
  pitchPhrases: [
    {
      startMs: 12000,
      endMs: 48000,
      notes: [
        { timeMs: 12000, frequency: 329.6, durationMs: 600,  semitone: -10, syllable: "Where" },
        { timeMs: 12600, frequency: 349.2, durationMs: 600,  semitone: -9,  syllable: "it" },
        { timeMs: 13200, frequency: 392.0, durationMs: 800,  semitone: -6,  syllable: "be-" },
        { timeMs: 14000, frequency: 440.0, durationMs: 2000, semitone: 0,   syllable: "gan" },
        { timeMs: 18000, frequency: 329.6, durationMs: 600,  semitone: -10, syllable: "I" },
        { timeMs: 18600, frequency: 349.2, durationMs: 600,  semitone: -9,  syllable: "don't" },
        { timeMs: 19200, frequency: 392.0, durationMs: 600,  semitone: -6,  syllable: "know" },
        { timeMs: 19800, frequency: 440.0, durationMs: 2500, semitone: 0,   syllable: "..." },
      ],
    },
    {
      startMs: 48000,
      endMs: 75000,
      notes: [
        { timeMs: 48000, frequency: 440.0, durationMs: 400,  semitone: 0,  syllable: "Sweet" },
        { timeMs: 48400, frequency: 493.9, durationMs: 400,  semitone: 2,  syllable: "Car-" },
        { timeMs: 48800, frequency: 523.3, durationMs: 800,  semitone: 3,  syllable: "o-" },
        { timeMs: 49600, frequency: 493.9, durationMs: 800,  semitone: 2,  syllable: "line" },
        { timeMs: 52000, frequency: 392.0, durationMs: 400,  semitone: -6, syllable: "Good" },
        { timeMs: 52400, frequency: 440.0, durationMs: 400,  semitone: 0,  syllable: "times" },
        { timeMs: 52800, frequency: 493.9, durationMs: 800,  semitone: 2,  syllable: "nev-" },
        { timeMs: 53600, frequency: 523.3, durationMs: 800,  semitone: 3,  syllable: "er" },
        { timeMs: 54400, frequency: 493.9, durationMs: 400,  semitone: 2,  syllable: "seemed" },
        { timeMs: 54800, frequency: 440.0, durationMs: 2000, semitone: 0,  syllable: "so" },
        { timeMs: 56800, frequency: 392.0, durationMs: 2000, semitone: -6, syllable: "good" },
        { timeMs: 62000, frequency: 440.0, durationMs: 400,  semitone: 0,  syllable: "I've" },
        { timeMs: 62400, frequency: 493.9, durationMs: 400,  semitone: 2,  syllable: "been" },
        { timeMs: 62800, frequency: 523.3, durationMs: 800,  semitone: 3,  syllable: "in-" },
        { timeMs: 63600, frequency: 493.9, durationMs: 800,  semitone: 2,  syllable: "clined" },
      ],
    },
    {
      startMs: 165000,
      endMs: 210000,
      notes: [
        { timeMs: 165000, frequency: 440.0, durationMs: 400,  semitone: 0,  syllable: "Sweet" },
        { timeMs: 165400, frequency: 493.9, durationMs: 400,  semitone: 2,  syllable: "Car-" },
        { timeMs: 165800, frequency: 523.3, durationMs: 800,  semitone: 3,  syllable: "o-" },
        { timeMs: 166600, frequency: 493.9, durationMs: 800,  semitone: 2,  syllable: "line" },
        { timeMs: 170000, frequency: 440.0, durationMs: 400,  semitone: 0,  syllable: "SWEET" },
        { timeMs: 170400, frequency: 493.9, durationMs: 400,  semitone: 2,  syllable: "CAR-" },
        { timeMs: 170800, frequency: 523.3, durationMs: 1200, semitone: 3,  syllable: "O-" },
        { timeMs: 172000, frequency: 493.9, durationMs: 2000, semitone: 2,  syllable: "LINE" },
      ],
    },
  ],
  coachingCues: [
    { timestampMs: 0,      message: "Instrumental intro — get ready!",   type: "intro"  },
    { timestampMs: 12000,  message: "Where it began...",                  type: "verse"  },
    { timestampMs: 35000,  message: "Build up to the chorus!",            type: "verse"  },
    { timestampMs: 48000,  message: "SWEET CAROLINE! 🎵",                 type: "chorus" },
    { timestampMs: 55000,  message: "BUM BUM BUM!",                       type: "hype"   },
    { timestampMs: 62000,  message: "Good times never seemed so good!",   type: "chorus" },
    { timestampMs: 90000,  message: "Second verse — keep the energy!",    type: "verse"  },
    { timestampMs: 120000, message: "Here it comes again!",               type: "hype"   },
    { timestampMs: 130000, message: "SWEET CAROLINE! LOUDER!",            type: "chorus" },
    { timestampMs: 170000, message: "SO GOOD! SO GOOD! SO GOOD!",        type: "hype"   },
  ],
};

export default context;
