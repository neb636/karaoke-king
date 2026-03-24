import type { SongContext } from "@/types/songContext";

const context: SongContext = {
  songId: "livin-on-a-prayer",
  version: 1,
  meta: {
    bpm: 123,
    keySignature: "E minor",
    timeSignature: "4/4",
    vocalRangeLowHz: 164.8, // E3
    vocalRangeHighHz: 587.3, // D5
  },
  sections: [
    { type: "intro",        startMs: 0,      endMs: 12000,  label: "Talk Box Intro",      isSinging: false, intensity: "soft"   },
    { type: "verse",        startMs: 12000,  endMs: 48000,  label: "Verse 1",              isSinging: true,  intensity: "medium" },
    { type: "pre-chorus",   startMs: 48000,  endMs: 60000,  label: "Pre-Chorus",           isSinging: true,  intensity: "loud"   },
    { type: "chorus",       startMs: 60000,  endMs: 105000, label: "Chorus",               isSinging: true,  intensity: "belt"   },
    { type: "verse",        startMs: 105000, endMs: 140000, label: "Verse 2",              isSinging: true,  intensity: "medium" },
    { type: "chorus",       startMs: 140000, endMs: 180000, label: "Chorus 2",             isSinging: true,  intensity: "belt"   },
    { type: "instrumental", startMs: 155000, endMs: 175000, label: "Guitar Solo",          isSinging: false, intensity: "soft"   },
    { type: "chorus",       startMs: 180000, endMs: 240000, label: "Final Chorus (Key+1)", isSinging: true,  intensity: "belt"   },
  ],
  pitchPhrases: [
    {
      startMs: 12000,
      endMs: 48000,
      notes: [
        { timeMs: 12000, frequency: 246.9, durationMs: 500,  semitone: -8,  syllable: "Tom-" },
        { timeMs: 12500, frequency: 261.6, durationMs: 500,  semitone: -7,  syllable: "my" },
        { timeMs: 13000, frequency: 293.7, durationMs: 500,  semitone: -5,  syllable: "used" },
        { timeMs: 13500, frequency: 329.6, durationMs: 500,  semitone: -10, syllable: "to" },
        { timeMs: 14000, frequency: 329.6, durationMs: 500,  semitone: -10, syllable: "work" },
        { timeMs: 14500, frequency: 349.2, durationMs: 500,  semitone: -9,  syllable: "on" },
        { timeMs: 15000, frequency: 392.0, durationMs: 750,  semitone: -6,  syllable: "the" },
        { timeMs: 15750, frequency: 440.0, durationMs: 2000, semitone: 0,   syllable: "docks" },
      ],
    },
    {
      startMs: 60000,
      endMs: 105000,
      notes: [
        { timeMs: 60000, frequency: 329.6, durationMs: 400,  semitone: -10, syllable: "WOAH" },
        { timeMs: 60400, frequency: 392.0, durationMs: 400,  semitone: -6,  syllable: "we're" },
        { timeMs: 60800, frequency: 440.0, durationMs: 400,  semitone: 0,   syllable: "half-" },
        { timeMs: 61200, frequency: 493.9, durationMs: 800,  semitone: 2,   syllable: "way" },
        { timeMs: 62000, frequency: 523.3, durationMs: 2000, semitone: 3,   syllable: "there" },
        { timeMs: 65000, frequency: 440.0, durationMs: 400,  semitone: 0,   syllable: "WOAH" },
        { timeMs: 65400, frequency: 493.9, durationMs: 400,  semitone: 2,   syllable: "liv-" },
        { timeMs: 65800, frequency: 523.3, durationMs: 400,  semitone: 3,   syllable: "in'" },
        { timeMs: 66200, frequency: 587.3, durationMs: 800,  semitone: 5,   syllable: "on" },
        { timeMs: 67000, frequency: 523.3, durationMs: 400,  semitone: 3,   syllable: "a" },
        { timeMs: 67400, frequency: 493.9, durationMs: 3000, semitone: 2,   syllable: "prayer" },
      ],
    },
    {
      startMs: 180000,
      endMs: 240000,
      notes: [
        { timeMs: 180000, frequency: 370.0, durationMs: 400,  semitone: -8,  syllable: "WOAH" },
        { timeMs: 180400, frequency: 415.3, durationMs: 400,  semitone: -5,  syllable: "we're" },
        { timeMs: 180800, frequency: 466.2, durationMs: 400,  semitone: -1,  syllable: "half-" },
        { timeMs: 181200, frequency: 523.3, durationMs: 800,  semitone: 3,   syllable: "way" },
        { timeMs: 182000, frequency: 554.4, durationMs: 2000, semitone: 4,   syllable: "there" },
        { timeMs: 185000, frequency: 466.2, durationMs: 400,  semitone: -1,  syllable: "WOAH" },
        { timeMs: 185400, frequency: 523.3, durationMs: 400,  semitone: 3,   syllable: "liv-" },
        { timeMs: 185800, frequency: 554.4, durationMs: 400,  semitone: 4,   syllable: "in'" },
        { timeMs: 186200, frequency: 622.3, durationMs: 800,  semitone: 6,   syllable: "on" },
        { timeMs: 187000, frequency: 554.4, durationMs: 400,  semitone: 4,   syllable: "a" },
        { timeMs: 187400, frequency: 523.3, durationMs: 3000, semitone: 3,   syllable: "prayer" },
      ],
    },
  ],
  coachingCues: [
    { timestampMs: 0,      message: "Talk box intro... WOAH!",              type: "intro"  },
    { timestampMs: 12000,  message: "Tommy used to work on the docks...",    type: "verse"  },
    { timestampMs: 30000,  message: "She says we've gotta hold on...",       type: "verse"  },
    { timestampMs: 48000,  message: "GET READY FOR THE CHORUS!",             type: "hype"   },
    { timestampMs: 60000,  message: "WOAH! LIVIN' ON A PRAYER!",             type: "chorus" },
    { timestampMs: 75000,  message: "Take my hand, we'll make it!",          type: "chorus" },
    { timestampMs: 105000, message: "Second verse — keep it going!",         type: "verse"  },
    { timestampMs: 140000, message: "WOAH! ONE MORE TIME!",                  type: "chorus" },
    { timestampMs: 180000, message: "Key change! GO HIGHER! 🔥",             type: "hype"   },
    { timestampMs: 210000, message: "LIVIN' ON A PRAYER! 🔥",                type: "chorus" },
  ],
};

export default context;
