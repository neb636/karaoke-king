import type { SongContext } from "@/types/songContext";

const context: SongContext = {
  songId: "dynamite",
  version: 1,
  meta: {
    bpm: 114,
    keySignature: "D major",
    timeSignature: "4/4",
    vocalRangeLowHz: 233.1, // Bb3
    vocalRangeHighHz: 523.3, // C5
  },
  sections: [
    { type: "intro",      startMs: 0,      endMs: 10000,  label: "Intro",         isSinging: true,  intensity: "medium" },
    { type: "verse",      startMs: 10000,  endMs: 52000,  label: "Verse 1",        isSinging: true,  intensity: "medium" },
    { type: "chorus",     startMs: 52000,  endMs: 90000,  label: "Chorus",         isSinging: true,  intensity: "belt"   },
    { type: "verse",      startMs: 90000,  endMs: 120000, label: "Verse 2",        isSinging: true,  intensity: "medium" },
    { type: "chorus",     startMs: 120000, endMs: 157000, label: "Chorus 2",       isSinging: true,  intensity: "belt"   },
    { type: "bridge",     startMs: 157000, endMs: 185000, label: "Na Na Bridge",   isSinging: true,  intensity: "loud"   },
    { type: "chorus",     startMs: 185000, endMs: 215000, label: "Final Chorus",   isSinging: true,  intensity: "belt"   },
  ],
  pitchPhrases: [
    {
      startMs: 10000,
      endMs: 52000,
      notes: [
        { timeMs: 10000, frequency: 370.0, durationMs: 400,  semitone: -8,  syllable: "Shoes" },
        { timeMs: 10400, frequency: 392.0, durationMs: 400,  semitone: -6,  syllable: "on" },
        { timeMs: 10800, frequency: 415.3, durationMs: 400,  semitone: -5,  syllable: "get" },
        { timeMs: 11200, frequency: 440.0, durationMs: 400,  semitone: 0,   syllable: "up" },
        { timeMs: 11600, frequency: 466.2, durationMs: 400,  semitone: 1,   syllable: "in" },
        { timeMs: 12000, frequency: 440.0, durationMs: 400,  semitone: 0,   syllable: "the" },
        { timeMs: 12400, frequency: 415.3, durationMs: 2000, semitone: -5,  syllable: "morn" },
        { timeMs: 16000, frequency: 370.0, durationMs: 400,  semitone: -8,  syllable: "Cup" },
        { timeMs: 16400, frequency: 392.0, durationMs: 400,  semitone: -6,  syllable: "of" },
        { timeMs: 16800, frequency: 415.3, durationMs: 400,  semitone: -5,  syllable: "milk" },
        { timeMs: 17200, frequency: 440.0, durationMs: 400,  semitone: 0,   syllable: "let's" },
        { timeMs: 17600, frequency: 466.2, durationMs: 400,  semitone: 1,   syllable: "rock" },
        { timeMs: 18000, frequency: 440.0, durationMs: 400,  semitone: 0,   syllable: "and" },
        { timeMs: 18400, frequency: 415.3, durationMs: 2000, semitone: -5,  syllable: "roll" },
      ],
    },
    {
      startMs: 52000,
      endMs: 90000,
      notes: [
        { timeMs: 52000, frequency: 440.0, durationMs: 400,  semitone: 0,  syllable: "'Cause" },
        { timeMs: 52400, frequency: 466.2, durationMs: 400,  semitone: 1,  syllable: "I-" },
        { timeMs: 52800, frequency: 493.9, durationMs: 400,  semitone: 2,  syllable: "I-" },
        { timeMs: 53200, frequency: 523.3, durationMs: 800,  semitone: 3,  syllable: "I'm" },
        { timeMs: 54000, frequency: 493.9, durationMs: 400,  semitone: 2,  syllable: "in" },
        { timeMs: 54400, frequency: 466.2, durationMs: 400,  semitone: 1,  syllable: "the" },
        { timeMs: 54800, frequency: 440.0, durationMs: 400,  semitone: 0,  syllable: "stars" },
        { timeMs: 55200, frequency: 415.3, durationMs: 400,  semitone: -5, syllable: "to-" },
        { timeMs: 55600, frequency: 440.0, durationMs: 2500, semitone: 0,  syllable: "night" },
        { timeMs: 62000, frequency: 440.0, durationMs: 400,  semitone: 0,  syllable: "dy-" },
        { timeMs: 62400, frequency: 466.2, durationMs: 400,  semitone: 1,  syllable: "na-" },
        { timeMs: 62800, frequency: 493.9, durationMs: 400,  semitone: 2,  syllable: "na-" },
        { timeMs: 63200, frequency: 523.3, durationMs: 400,  semitone: 3,  syllable: "na-" },
        { timeMs: 63600, frequency: 493.9, durationMs: 400,  semitone: 2,  syllable: "mite" },
      ],
    },
  ],
  coachingCues: [
    { timestampMs: 0,      message: "Light it up!",                           type: "intro"  },
    { timestampMs: 10000,  message: "Shoes on, get up in the morn...",        type: "verse"  },
    { timestampMs: 25000,  message: "Cup of milk, let's rock and roll!",      type: "verse"  },
    { timestampMs: 40000,  message: "Bring a friend, join the crowd!",        type: "verse"  },
    { timestampMs: 52000,  message: "'Cause I-I-I'm in the stars tonight!",   type: "chorus" },
    { timestampMs: 68000,  message: "DY-NA-NA-NA-MITE! 💥",                   type: "chorus" },
    { timestampMs: 90000,  message: "Shining through the city!",              type: "verse"  },
    { timestampMs: 120000, message: "LIGHT IT UP LIKE DYNAMITE!",             type: "chorus" },
    { timestampMs: 155000, message: "DY-NA-NA-NA-MITE!",                      type: "chorus" },
    { timestampMs: 185000, message: "One more time! DYNAMITE! 🔥",            type: "hype"   },
  ],
};

export default context;
