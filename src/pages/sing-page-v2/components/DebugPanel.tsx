import { useState, useEffect } from "react";
import type { LiveStats, FeedbackState } from "@/features/audio/useAudio";
import type { ScoringMode } from "@/lib/constants";

const DEBUG_KEY = "karaoke-debug";

export function isDebugMode(): boolean {
  try {
    return localStorage.getItem(DEBUG_KEY) === "1";
  } catch {
    return false;
  }
}

interface DebugPanelProps {
  songId: string | null;
  isCurated: boolean;
  isListening: boolean;
  showReadyOverlay: boolean;
  countdownActive: boolean;
  currentPlayer: number;
  currentRound: number;
  totalRounds: number;
  playersCount: number;
  scoringMode: ScoringMode;
  coachingEnabled: boolean;
  spotifyPlaying: boolean;
  currentPositionMs: number;
  finishSecondsLeft: number;
  stats: LiveStats;
  feedback: FeedbackState;
  activeLine: unknown;
  spotifyError: string | null;
  gapMs: number | null;
  onGapMsChange: (value: number) => void;
  onRestart: () => void;
}

export function DebugPanel(props: DebugPanelProps) {
  const [collapsed, setCollapsed] = useState(true);
  const [gapInput, setGapInput] = useState<string>("");

  // Sync local input when gapMs prop changes (e.g. song first loads)
  useEffect(() => {
    if (props.gapMs !== null) {
      setGapInput(String(props.gapMs));
    }
  }, [props.gapMs]);

  if (!isDebugMode()) return null;

  const songJsonUrl = props.songId
    ? `${import.meta.env.BASE_URL}song-data/${props.songId}.json`
    : null;

  const state = {
    phase: props.showReadyOverlay
      ? "ready-overlay"
      : props.countdownActive
        ? "countdown"
        : props.isListening
          ? "singing"
          : "idle",
    songId: props.songId,
    isCurated: props.isCurated,
    currentPlayer: props.currentPlayer,
    currentRound: props.currentRound,
    totalRounds: props.totalRounds,
    playersCount: props.playersCount,
    scoringMode: props.scoringMode,
    coachingEnabled: props.coachingEnabled,
    spotify: {
      playing: props.spotifyPlaying,
      positionMs: props.currentPositionMs,
      error: props.spotifyError,
    },
    finishSecondsLeft: props.finishSecondsLeft,
    stats: props.stats,
    feedback: props.feedback,
    activeLine: props.activeLine,
  };

  function handleGapCommit() {
    const parsed = Number(gapInput);
    if (!isNaN(parsed)) {
      props.onGapMsChange(parsed);
    }
  }

  return (
    <div className="fixed bottom-2 right-2 z-[9999] max-w-[380px] text-[11px] font-mono">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="ml-auto block px-2 py-0.5 rounded-t bg-black/80 text-yellow-300 border border-yellow-500/40 border-b-0 hover:bg-yellow-900/40"
      >
        {collapsed ? "▶ Debug" : "▼ Debug"}
      </button>

      {!collapsed && (
        <div className="bg-black/90 border border-yellow-500/40 rounded-b rounded-tl p-2 space-y-1.5 max-h-[50vh] overflow-auto text-yellow-100/90">
          {songJsonUrl && (
            <div>
              <span className="text-yellow-400">Song JSON: </span>
              <a
                href={songJsonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-cyan-300 break-all"
              >
                {songJsonUrl}
              </a>
            </div>
          )}

          {props.isCurated && (
            <div className="flex items-center gap-1.5 pt-0.5">
              <label className="text-yellow-400 shrink-0">gapMs:</label>
              <input
                type="number"
                value={gapInput}
                onChange={(e) => setGapInput(e.target.value)}
                onBlur={handleGapCommit}
                onKeyDown={(e) => e.key === "Enter" && handleGapCommit()}
                className="w-24 bg-black/60 border border-yellow-500/50 rounded px-1 py-0.5 text-yellow-100 text-[11px]"
              />
              <button
                onClick={props.onRestart}
                className="px-2 py-0.5 rounded bg-yellow-600/70 hover:bg-yellow-500/80 text-black font-bold text-[11px]"
              >
                ↺ Restart
              </button>
            </div>
          )}

          <pre className="whitespace-pre-wrap break-words leading-tight">
            {JSON.stringify(state, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
