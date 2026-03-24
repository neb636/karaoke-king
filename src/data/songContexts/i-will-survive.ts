import type { SongContext } from "@/types/songContext";

const context: SongContext = {
  songId: "i-will-survive",
  version: 1,
  meta: {
    bpm: 117,
    keySignature: "A minor",
    timeSignature: "4/4",
    vocalRangeLowHz: 220.0, // A3
    vocalRangeHighHz: 587.3, // D5
  },
  sections: [
    { type: "intro",      startMs: 0,      endMs: 10000,  label: "At First I Was Afraid", isSinging: true,  intensity: "soft"   },
    { type: "verse",      startMs: 10000,  endMs: 45000,  label: "Verse 1",                isSinging: true,  intensity: "medium" },
    { type: "chorus",     startMs: 45000,  endMs: 85000,  label: "Chorus",                 isSinging: true,  intensity: "belt"   },
    { type: "verse",      startMs: 85000,  endMs: 120000, label: "Verse 2",                isSinging: true,  intensity: "medium" },
    { type: "chorus",     startMs: 120000, endMs: 165000, label: "Chorus 2",               isSinging: true,  intensity: "belt"   },
    { type: "bridge",     startMs: 165000, endMs: 185000, label: "Bridge",                 isSinging: true,  intensity: "loud"   },
    { type: "chorus",     startMs: 185000, endMs: 220000, label: "Final Chorus",           isSinging: true,  intensity: "belt"   },
  ],
  pitchPhrases: [
    {
      startMs: 0,
      endMs: 45000,
      notes: [
        { timeMs: 0,     frequency: 220.0, durationMs: 500,  semitone: -12, syllable: "At" },
        { timeMs: 500,   frequency: 246.9, durationMs: 500,  semitone: -8,  syllable: "first" },
        { timeMs: 1000,  frequency: 261.6, durationMs: 500,  semitone: -7,  syllable: "I" },
        { timeMs: 1500,  frequency: 293.7, durationMs: 500,  semitone: -5,  syllable: "was" },
        { timeMs: 2000,  frequency: 329.6, durationMs: 800,  semitone: -10, syllable: "a-" },
        { timeMs: 2800,  frequency: 349.2, durationMs: 2000, semitone: -9,  syllable: "fraid" },
        { timeMs: 6000,  frequency: 261.6, durationMs: 500,  semitone: -7,  syllable: "I" },
        { timeMs: 6500,  frequency: 293.7, durationMs: 500,  semitone: -5,  syllable: "was" },
        { timeMs: 7000,  frequency: 329.6, durationMs: 500,  semitone: -10, syllable: "pet-" },
        { timeMs: 7500,  frequency: 349.2, durationMs: 500,  semitone: -9,  syllable: "ri-" },
        { timeMs: 8000,  frequency: 392.0, durationMs: 3000, semitone: -6,  syllable: "fied" },
      ],
    },
    {
      startMs: 45000,
      endMs: 85000,
      notes: [
        { timeMs: 45000, frequency: 440.0, durationMs: 400,  semitone: 0,  syllable: "Oh" },
        { timeMs: 45400, frequency: 493.9, durationMs: 400,  semitone: 2,  syllable: "no" },
        { timeMs: 45800, frequency: 523.3, durationMs: 400,  semitone: 3,  syllable: "not" },
        { timeMs: 46200, frequency: 493.9, durationMs: 400,  semitone: 2,  syllable: "I" },
        { timeMs: 47000, frequency: 440.0, durationMs: 400,  semitone: 0,  syllable: "I" },
        { timeMs: 47400, frequency: 392.0, durationMs: 400,  semitone: -6, syllable: "will" },
        { timeMs: 47800, frequency: 440.0, durationMs: 400,  semitone: 0,  syllable: "sur-" },
        { timeMs: 48200, frequency: 493.9, durationMs: 3000, semitone: 2,  syllable: "vive" },
        { timeMs: 53000, frequency: 440.0, durationMs: 400,  semitone: 0,  syllable: "As" },
        { timeMs: 53400, frequency: 392.0, durationMs: 400,  semitone: -6, syllable: "long" },
        { timeMs: 53800, frequency: 349.2, durationMs: 400,  semitone: -9, syllable: "as" },
        { timeMs: 54200, frequency: 392.0, durationMs: 400,  semitone: -6, syllable: "I" },
        { timeMs: 54600, frequency: 440.0, durationMs: 400,  semitone: 0,  syllable: "know" },
        { timeMs: 55000, frequency: 493.9, durationMs: 400,  semitone: 2,  syllable: "how" },
        { timeMs: 55400, frequency: 523.3, durationMs: 400,  semitone: 3,  syllable: "to" },
        { timeMs: 55800, frequency: 587.3, durationMs: 2500, semitone: 5,  syllable: "love" },
      ],
    },
  ],
  coachingCues: [
    { timestampMs: 0,      message: "At first I was afraid...",           type: "intro"  },
    { timestampMs: 10000,  message: "I was petrified...",                  type: "verse"  },
    { timestampMs: 28000,  message: "Build it up!",                        type: "verse"  },
    { timestampMs: 45000,  message: "Oh no not I! I WILL SURVIVE!",        type: "chorus" },
    { timestampMs: 60000,  message: "As long as I know how to love!",      type: "chorus" },
    { timestampMs: 80000,  message: "I know I'll stay alive!",             type: "chorus" },
    { timestampMs: 100000, message: "Keep that energy! 💪",                type: "hype"   },
    { timestampMs: 130000, message: "I will survive! HEY HEY!",            type: "chorus" },
    { timestampMs: 160000, message: "Bring it home!",                      type: "hype"   },
    { timestampMs: 185000, message: "I WILL SURVIVE! 🎤",                  type: "chorus" },
  ],
};

export default context;
