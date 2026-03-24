import type { SongContext } from "@/types/songContext";

const context: SongContext = {
  songId: "bohemian-rhapsody",
  version: 1,
  meta: {
    bpm: 72,
    keySignature: "Bb major",
    timeSignature: "4/4",
    vocalRangeLowHz: 130.8, // C3
    vocalRangeHighHz: 698.5, // F5
  },
  sections: [
    { type: "intro",        startMs: 0,      endMs: 49000,  label: "A Cappella Intro",  isSinging: true,  intensity: "soft"   },
    { type: "verse",        startMs: 49000,  endMs: 90000,  label: "Verse 1 — Ballad",  isSinging: true,  intensity: "medium" },
    { type: "verse",        startMs: 90000,  endMs: 130000, label: "Verse 2 — Ballad",  isSinging: true,  intensity: "medium" },
    { type: "instrumental", startMs: 130000, endMs: 175000, label: "Guitar Solo",       isSinging: false, intensity: "soft"   },
    { type: "chorus",       startMs: 175000, endMs: 215000, label: "Opera Section",     isSinging: true,  intensity: "belt"   },
    { type: "bridge",       startMs: 215000, endMs: 260000, label: "Hard Rock Section", isSinging: true,  intensity: "belt"   },
    { type: "outro",        startMs: 260000, endMs: 354000, label: "Outro Ballad",      isSinging: true,  intensity: "soft"   },
  ],
  pitchPhrases: [
    {
      startMs: 0,
      endMs: 15000,
      notes: [
        { timeMs: 0,     frequency: 233.1, durationMs: 750,  semitone: -11, syllable: "Is" },
        { timeMs: 750,   frequency: 261.6, durationMs: 500,  semitone: -7,  syllable: "this" },
        { timeMs: 1250,  frequency: 293.7, durationMs: 500,  semitone: -5,  syllable: "the" },
        { timeMs: 1750,  frequency: 311.1, durationMs: 750,  semitone: -4,  syllable: "re-" },
        { timeMs: 2500,  frequency: 349.2, durationMs: 1500, semitone: -9,  syllable: "al" },
        { timeMs: 4000,  frequency: 261.6, durationMs: 500,  semitone: -7,  syllable: "life?" },
        { timeMs: 6000,  frequency: 233.1, durationMs: 750,  semitone: -11, syllable: "Is" },
        { timeMs: 6750,  frequency: 261.6, durationMs: 500,  semitone: -7,  syllable: "this" },
        { timeMs: 7250,  frequency: 293.7, durationMs: 500,  semitone: -5,  syllable: "just" },
        { timeMs: 7750,  frequency: 311.1, durationMs: 750,  semitone: -4,  syllable: "fan-" },
        { timeMs: 8500,  frequency: 349.2, durationMs: 3000, semitone: -9,  syllable: "ta-" },
        { timeMs: 11500, frequency: 233.1, durationMs: 1500, semitone: -11, syllable: "sy" },
      ],
    },
    {
      startMs: 49000,
      endMs: 90000,
      notes: [
        { timeMs: 49000, frequency: 233.1, durationMs: 500,  semitone: -11, syllable: "Ma-" },
        { timeMs: 49500, frequency: 261.6, durationMs: 500,  semitone: -7,  syllable: "ma," },
        { timeMs: 51000, frequency: 233.1, durationMs: 500,  semitone: -11, syllable: "just" },
        { timeMs: 51500, frequency: 293.7, durationMs: 500,  semitone: -5,  syllable: "killed" },
        { timeMs: 52000, frequency: 311.1, durationMs: 500,  semitone: -4,  syllable: "a" },
        { timeMs: 52500, frequency: 349.2, durationMs: 750,  semitone: -9,  syllable: "man" },
        { timeMs: 55000, frequency: 261.6, durationMs: 500,  semitone: -7,  syllable: "Put" },
        { timeMs: 55500, frequency: 293.7, durationMs: 500,  semitone: -5,  syllable: "a" },
        { timeMs: 56000, frequency: 349.2, durationMs: 500,  semitone: -9,  syllable: "gun" },
        { timeMs: 56500, frequency: 392.0, durationMs: 500,  semitone: -6,  syllable: "a-" },
        { timeMs: 57000, frequency: 440.0, durationMs: 750,  semitone: 0,   syllable: "gainst" },
        { timeMs: 57750, frequency: 392.0, durationMs: 500,  semitone: -6,  syllable: "his" },
        { timeMs: 58250, frequency: 349.2, durationMs: 3000, semitone: -9,  syllable: "head" },
      ],
    },
    {
      startMs: 175000,
      endMs: 215000,
      notes: [
        { timeMs: 175000, frequency: 523.3, durationMs: 400,  semitone: 3,  syllable: "Gal-" },
        { timeMs: 175400, frequency: 493.9, durationMs: 400,  semitone: 2,  syllable: "i-" },
        { timeMs: 175800, frequency: 523.3, durationMs: 400,  semitone: 3,  syllable: "le-" },
        { timeMs: 176200, frequency: 587.3, durationMs: 800,  semitone: 5,  syllable: "o!" },
        { timeMs: 178000, frequency: 523.3, durationMs: 400,  semitone: 3,  syllable: "Gal-" },
        { timeMs: 178400, frequency: 493.9, durationMs: 400,  semitone: 2,  syllable: "i-" },
        { timeMs: 178800, frequency: 523.3, durationMs: 400,  semitone: 3,  syllable: "le-" },
        { timeMs: 179200, frequency: 587.3, durationMs: 800,  semitone: 5,  syllable: "o!" },
        { timeMs: 185000, frequency: 659.3, durationMs: 500,  semitone: 7,  syllable: "Let" },
        { timeMs: 185500, frequency: 698.5, durationMs: 1000, semitone: 8,  syllable: "me" },
        { timeMs: 186500, frequency: 659.3, durationMs: 500,  semitone: 7,  syllable: "go!" },
      ],
    },
    {
      startMs: 260000,
      endMs: 354000,
      notes: [
        { timeMs: 260000, frequency: 233.1, durationMs: 500,  semitone: -11, syllable: "Noth-" },
        { timeMs: 260500, frequency: 261.6, durationMs: 500,  semitone: -7,  syllable: "ing" },
        { timeMs: 261000, frequency: 293.7, durationMs: 500,  semitone: -5,  syllable: "real-" },
        { timeMs: 261500, frequency: 349.2, durationMs: 2000, semitone: -9,  syllable: "ly" },
        { timeMs: 263500, frequency: 261.6, durationMs: 500,  semitone: -7,  syllable: "mat-" },
        { timeMs: 264000, frequency: 233.1, durationMs: 3000, semitone: -11, syllable: "ters" },
      ],
    },
  ],
  coachingCues: [
    { timestampMs: 0,      message: "Is this the real life...",            type: "intro"        },
    { timestampMs: 15000,  message: "Soft and gentle... build slowly",     type: "verse"        },
    { timestampMs: 49000,  message: "Mama... just killed a man...",        type: "verse"        },
    { timestampMs: 90000,  message: "Here comes the ballad section",       type: "verse"        },
    { timestampMs: 130000, message: "Guitar solo — catch your breath!",    type: "instrumental" },
    { timestampMs: 175000, message: "GALILEO! GALILEO!",                   type: "chorus"       },
    { timestampMs: 195000, message: "Let me go! Give it everything!",      type: "hype"         },
    { timestampMs: 215000, message: "HEAD BANG TIME! 🎸",                  type: "hype"         },
    { timestampMs: 260000, message: "Nothing really matters...",           type: "verse"        },
    { timestampMs: 320000, message: "Any way the wind blows...",           type: "chorus"       },
  ],
};

export default context;
