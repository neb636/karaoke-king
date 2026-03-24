import type { SongContext } from "@/types/songContext";

const context: SongContext = {
  songId: "rolling-in-the-deep",
  version: 1,
  meta: {
    bpm: 105,
    keySignature: "C minor",
    timeSignature: "4/4",
    vocalRangeLowHz: 220.0, // A3
    vocalRangeHighHz: 659.3, // E5
  },
  sections: [
    { type: "intro",      startMs: 0,      endMs: 14000,  label: "Intro",         isSinging: true,  intensity: "soft"   },
    { type: "verse",      startMs: 14000,  endMs: 55000,  label: "Verse 1",        isSinging: true,  intensity: "medium" },
    { type: "pre-chorus", startMs: 43000,  endMs: 55000,  label: "Pre-Chorus",     isSinging: true,  intensity: "loud"   },
    { type: "chorus",     startMs: 55000,  endMs: 100000, label: "Chorus",         isSinging: true,  intensity: "belt"   },
    { type: "verse",      startMs: 100000, endMs: 145000, label: "Verse 2",        isSinging: true,  intensity: "medium" },
    { type: "chorus",     startMs: 145000, endMs: 185000, label: "Chorus 2",       isSinging: true,  intensity: "belt"   },
    { type: "bridge",     startMs: 185000, endMs: 210000, label: "Bridge",         isSinging: true,  intensity: "loud"   },
    { type: "chorus",     startMs: 210000, endMs: 240000, label: "Final Chorus",   isSinging: true,  intensity: "belt"   },
  ],
  pitchPhrases: [
    {
      startMs: 0,
      endMs: 55000,
      notes: [
        { timeMs: 0,     frequency: 261.6, durationMs: 500,  semitone: -7,  syllable: "There's" },
        { timeMs: 500,   frequency: 293.7, durationMs: 500,  semitone: -5,  syllable: "a" },
        { timeMs: 1000,  frequency: 311.1, durationMs: 500,  semitone: -4,  syllable: "fire" },
        { timeMs: 1500,  frequency: 349.2, durationMs: 800,  semitone: -9,  syllable: "start-" },
        { timeMs: 2300,  frequency: 392.0, durationMs: 1000, semitone: -6,  syllable: "ing" },
        { timeMs: 3300,  frequency: 349.2, durationMs: 500,  semitone: -9,  syllable: "in" },
        { timeMs: 3800,  frequency: 311.1, durationMs: 500,  semitone: -4,  syllable: "my" },
        { timeMs: 4300,  frequency: 261.6, durationMs: 2000, semitone: -7,  syllable: "heart" },
      ],
    },
    {
      startMs: 55000,
      endMs: 100000,
      notes: [
        { timeMs: 55000, frequency: 523.3, durationMs: 400,  semitone: 3,  syllable: "We" },
        { timeMs: 55400, frequency: 587.3, durationMs: 400,  semitone: 5,  syllable: "could" },
        { timeMs: 55800, frequency: 622.3, durationMs: 400,  semitone: 6,  syllable: "have" },
        { timeMs: 56200, frequency: 659.3, durationMs: 1500, semitone: 7,  syllable: "had" },
        { timeMs: 57700, frequency: 587.3, durationMs: 500,  semitone: 5,  syllable: "it" },
        { timeMs: 58200, frequency: 523.3, durationMs: 3000, semitone: 3,  syllable: "all" },
        { timeMs: 63000, frequency: 440.0, durationMs: 400,  semitone: 0,  syllable: "Roll-" },
        { timeMs: 63400, frequency: 493.9, durationMs: 400,  semitone: 2,  syllable: "ing" },
        { timeMs: 63800, frequency: 523.3, durationMs: 400,  semitone: 3,  syllable: "in" },
        { timeMs: 64200, frequency: 587.3, durationMs: 400,  semitone: 5,  syllable: "the" },
        { timeMs: 64600, frequency: 622.3, durationMs: 400,  semitone: 6,  syllable: "deep" },
        { timeMs: 65000, frequency: 587.3, durationMs: 2500, semitone: 5,  syllable: "..." },
      ],
    },
    {
      startMs: 210000,
      endMs: 240000,
      notes: [
        { timeMs: 210000, frequency: 523.3, durationMs: 400,  semitone: 3,  syllable: "We" },
        { timeMs: 210400, frequency: 587.3, durationMs: 400,  semitone: 5,  syllable: "could" },
        { timeMs: 210800, frequency: 622.3, durationMs: 400,  semitone: 6,  syllable: "have" },
        { timeMs: 211200, frequency: 659.3, durationMs: 2000, semitone: 7,  syllable: "had" },
        { timeMs: 213200, frequency: 587.3, durationMs: 500,  semitone: 5,  syllable: "it" },
        { timeMs: 213700, frequency: 523.3, durationMs: 3500, semitone: 3,  syllable: "all" },
      ],
    },
  ],
  coachingCues: [
    { timestampMs: 0,      message: "There's a fire starting in my heart...", type: "intro"  },
    { timestampMs: 14000,  message: "Reaching a fever pitch...",               type: "verse"  },
    { timestampMs: 30000,  message: "The scars of your love...",               type: "verse"  },
    { timestampMs: 55000,  message: "We could have had it ALL!",               type: "chorus" },
    { timestampMs: 68000,  message: "ROLLING IN THE DEEP!",                   type: "chorus" },
    { timestampMs: 80000,  message: "You had my heart inside your hand!",      type: "chorus" },
    { timestampMs: 110000, message: "Baby I have no story to be told...",      type: "verse"  },
    { timestampMs: 145000, message: "We could have had it ALL!",               type: "chorus" },
    { timestampMs: 180000, message: "ROLLING IN THE DEEP! LOUDER!",           type: "chorus" },
    { timestampMs: 210000, message: "You played it to the beat! 🔥",          type: "hype"   },
  ],
};

export default context;
