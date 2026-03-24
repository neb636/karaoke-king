import type { SongContext } from "@/types/songContext";

const context: SongContext = {
  songId: "mr-brightside",
  version: 1,
  meta: {
    bpm: 148,
    keySignature: "Bb major",
    timeSignature: "4/4",
    vocalRangeLowHz: 220.0, // A3
    vocalRangeHighHz: 523.3, // C5
  },
  sections: [
    { type: "intro",      startMs: 0,      endMs: 13000,  label: "Guitar Riff",   isSinging: false, intensity: "soft"   },
    { type: "verse",      startMs: 13000,  endMs: 50000,  label: "Verse 1",        isSinging: true,  intensity: "medium" },
    { type: "chorus",     startMs: 50000,  endMs: 90000,  label: "Chorus",         isSinging: true,  intensity: "belt"   },
    { type: "verse",      startMs: 90000,  endMs: 120000, label: "Verse 2",        isSinging: true,  intensity: "medium" },
    { type: "chorus",     startMs: 120000, endMs: 165000, label: "Chorus 2",       isSinging: true,  intensity: "belt"   },
    { type: "outro",      startMs: 165000, endMs: 220000, label: "Outro Loop",     isSinging: true,  intensity: "belt"   },
  ],
  pitchPhrases: [
    {
      startMs: 13000,
      endMs: 50000,
      notes: [
        { timeMs: 13000, frequency: 349.2, durationMs: 400,  semitone: -9,  syllable: "Com-" },
        { timeMs: 13400, frequency: 392.0, durationMs: 400,  semitone: -6,  syllable: "ing" },
        { timeMs: 13800, frequency: 440.0, durationMs: 400,  semitone: 0,   syllable: "out" },
        { timeMs: 14200, frequency: 466.2, durationMs: 400,  semitone: 1,   syllable: "of" },
        { timeMs: 14600, frequency: 440.0, durationMs: 400,  semitone: 0,   syllable: "my" },
        { timeMs: 15000, frequency: 392.0, durationMs: 2000, semitone: -6,  syllable: "cage" },
        { timeMs: 18000, frequency: 349.2, durationMs: 400,  semitone: -9,  syllable: "and" },
        { timeMs: 18400, frequency: 392.0, durationMs: 400,  semitone: -6,  syllable: "I've" },
        { timeMs: 18800, frequency: 440.0, durationMs: 400,  semitone: 0,   syllable: "been" },
        { timeMs: 19200, frequency: 466.2, durationMs: 400,  semitone: 1,   syllable: "do-" },
        { timeMs: 19600, frequency: 493.9, durationMs: 400,  semitone: 2,   syllable: "ing" },
        { timeMs: 20000, frequency: 466.2, durationMs: 400,  semitone: 1,   syllable: "just" },
        { timeMs: 20400, frequency: 440.0, durationMs: 2500, semitone: 0,   syllable: "fine" },
      ],
    },
    {
      startMs: 50000,
      endMs: 90000,
      notes: [
        { timeMs: 50000, frequency: 440.0, durationMs: 400,  semitone: 0,  syllable: "Jeal-" },
        { timeMs: 50400, frequency: 493.9, durationMs: 400,  semitone: 2,  syllable: "ous-" },
        { timeMs: 50800, frequency: 523.3, durationMs: 600,  semitone: 3,  syllable: "y" },
        { timeMs: 52000, frequency: 493.9, durationMs: 400,  semitone: 2,  syllable: "turn-" },
        { timeMs: 52400, frequency: 440.0, durationMs: 400,  semitone: 0,  syllable: "ing" },
        { timeMs: 52800, frequency: 392.0, durationMs: 400,  semitone: -6, syllable: "saints" },
        { timeMs: 53200, frequency: 349.2, durationMs: 400,  semitone: -9, syllable: "in-" },
        { timeMs: 53600, frequency: 392.0, durationMs: 400,  semitone: -6, syllable: "to" },
        { timeMs: 54000, frequency: 440.0, durationMs: 2500, semitone: 0,  syllable: "the" },
        { timeMs: 60000, frequency: 440.0, durationMs: 400,  semitone: 0,  syllable: "I'm" },
        { timeMs: 60400, frequency: 493.9, durationMs: 400,  semitone: 2,  syllable: "Mis-" },
        { timeMs: 60800, frequency: 523.3, durationMs: 400,  semitone: 3,  syllable: "ter" },
        { timeMs: 61200, frequency: 493.9, durationMs: 400,  semitone: 2,  syllable: "Bright-" },
        { timeMs: 61600, frequency: 440.0, durationMs: 3000, semitone: 0,  syllable: "side" },
      ],
    },
  ],
  coachingCues: [
    { timestampMs: 0,      message: "Guitar riff incoming...",              type: "intro"  },
    { timestampMs: 13000,  message: "Coming out of my cage!",               type: "verse"  },
    { timestampMs: 22000,  message: "And I've been doing just fine!",       type: "verse"  },
    { timestampMs: 35000,  message: "It started out with a kiss...",        type: "verse"  },
    { timestampMs: 50000,  message: "JEALOUSY! Turning saints into the sea!", type: "chorus" },
    { timestampMs: 68000,  message: "I'M MR. BRIGHTSIDE!",                  type: "chorus" },
    { timestampMs: 90000,  message: "Coming out of my cage!",               type: "verse"  },
    { timestampMs: 120000, message: "HERE IT COMES AGAIN!",                 type: "hype"   },
    { timestampMs: 150000, message: "I NEVER! 🎤",                          type: "chorus" },
    { timestampMs: 190000, message: "I'M MR BRIGHTSIDE! LOUDER!",           type: "chorus" },
  ],
};

export default context;
