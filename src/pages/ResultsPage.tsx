import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { NeonText } from "@/components/NeonText";
import { Button } from "@/components/ui/button";
import { ScoreCard } from "@/components/ScoreCard";
import { ScoreBreakdown } from "@/components/ScoreBreakdown";
import { CumulativeStandings } from "@/components/CumulativeStandings";
import { RoundIndicator } from "@/components/RoundIndicator";
import { SongResultBadge } from "@/components/SongResultBadge";
import { useGameStore } from "@/store/gameStore";
import { useSongStore } from "@/store/songStore";
import { useConfetti } from "@/hooks/useConfetti";
import { saveSongScore } from "@/services/songHistory";
import { GAME_MODES, PLAYER_COLORS } from "@/lib/constants";
import type { RankedPlayer } from "@/types";

export function ResultsPage() {
  const navigate = useNavigate();
  const { spawn: spawnConfetti } = useConfetti();
  const {
    players,
    scores,
    cumulativeScores,
    currentRound,
    totalRounds,
    selectedMode,
    nextRound,
    initNewGame,
    resetToPlayerSetup,
  } = useGameStore();

  const { playMode, getPlayerSong, clearPlayerSongs, setPickingPlayer } = useSongStore();
  const isCurated = playMode === "curated";

  const isLastRound = currentRound >= totalRounds;
  const isTournament = totalRounds > 1;

  // Build ranked list
  const ranked: RankedPlayer[] = players
    .map((player, i) => {
      const score = scores[i] ?? {
        total: 0, energy: 0, pitch: 0, sustain: 0, duration: 0, time: 0, bumpers: false,
      };
      return {
        name: player.name || `Player ${i + 1}`,
        index: i,
        score,
        color: PLAYER_COLORS[i % PLAYER_COLORS.length]!,
      };
    })
    .sort((a, b) => b.score.total - a.score.total);

  const isTie =
    ranked.length > 1 && ranked[0]!.score.total === ranked[1]!.score.total;

  // Save song scores for curated mode (per-player songs)
  const newBestFlags = useMemo(() => {
    if (!isCurated) return {};
    const flags: Record<number, boolean> = {};
    for (const p of ranked) {
      const playerSong = getPlayerSong(p.index);
      if (playerSong) {
        flags[p.index] = saveSongScore(playerSong.id, p.score.total);
      }
    }
    return flags;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tournament champion (by cumulative)
  const cumRanked = [...players]
    .map((_, i) => ({ i, cum: cumulativeScores[i] ?? 0 }))
    .sort((a, b) => b.cum - a.cum);
  const cumTie =
    cumRanked.length > 1 && cumRanked[0]!.cum === cumRanked[1]!.cum;
  const champion = players[cumRanked[0]?.i ?? 0];

  const title = isTournament
    ? isLastRound
      ? "FINAL RESULTS"
      : `ROUND ${currentRound} RESULTS`
    : "RESULTS";

  const subtitle = isTournament
    ? isLastRound
      ? `${GAME_MODES[selectedMode].label} complete!`
      : `${totalRounds - currentRound} round${totalRounds - currentRound !== 1 ? "s" : ""} remaining`
    : "THE MOMENT OF TRUTH";

  const winnerText =
    isLastRound && isTournament
      ? cumTie
        ? "IT'S A TIE! SHARED GLORY!"
        : `👑 ${champion?.name || "Player"} IS THE CHAMPION! 👑`
      : isTie
        ? "ROUND TIE!"
        : `🎤 ${ranked[0]?.name || "Player"} WINS THIS ROUND!`;

  useEffect(() => {
    if (isLastRound) spawnConfetti();
  }, [isLastRound, spawnConfetti]);

  function handleNextRound() {
    nextRound();
    if (isCurated) {
      clearPlayerSongs();
      setPickingPlayer(0);
      void navigate("/songs");
    } else {
      void navigate("/sing");
    }
  }

  function handleRematch() {
    initNewGame();
    if (isCurated) {
      clearPlayerSongs();
      setPickingPlayer(0);
      void navigate("/songs");
    } else {
      void navigate("/sing");
    }
  }

  function handleNewGame() {
    resetToPlayerSetup();
    void navigate("/players");
  }

  return (
    <div className="screen-container overflow-y-auto justify-start py-8 px-4 gap-4">
      <NeonText as="h2" color="pink" className="text-[clamp(1.8rem,6vw,4rem)]">
        {title}
      </NeonText>
      <p className="text-sm opacity-50 tracking-[3px]">{subtitle}</p>

      <RoundIndicator totalRounds={totalRounds} currentRound={currentRound} />

      {/* Per-player song badges (curated mode) */}
      {isCurated && (
        <div className="flex gap-3 flex-wrap justify-center w-full max-w-[900px]">
          {ranked.map((p) => {
            const playerSong = getPlayerSong(p.index);
            if (!playerSong) return null;
            return (
              <div key={p.index} className="text-center">
                <p className="text-xs uppercase tracking-widest opacity-40 mb-1">{p.name}</p>
                <SongResultBadge
                  song={playerSong}
                  isNewBest={!!newBestFlags[p.index]}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Winner banner */}
      <div className="font-display text-[clamp(1.1rem,3.5vw,2.2rem)] animate-glow-pulse neon-gold text-center px-2">
        {winnerText}
      </div>

      {/* Score cards */}
      <div className="flex gap-3 items-end justify-center flex-wrap w-full max-w-[900px]">
        {ranked.map((player, rank) => (
          <ScoreCard key={player.index} player={player} rank={rank} />
        ))}
      </div>

      {/* Cumulative standings (multi-round) */}
      {isTournament && (
        <CumulativeStandings
          players={players}
          cumulativeScores={cumulativeScores}
          currentRound={currentRound}
        />
      )}

      {/* Per-player score breakdown */}
      <ScoreBreakdown players={ranked} isCurated={isCurated} getPlayerSong={getPlayerSong} />

      {/* Action buttons */}
      <div className="flex gap-4 flex-wrap justify-center mt-2 pb-4">
        {!isLastRound && (
          <Button variant="pink" onClick={handleNextRound}>
            {isCurated ? "🎵 Pick Songs for Next Round" : "▶ Next Round"}
          </Button>
        )}
        {isLastRound && (
          <Button variant="gold" onClick={handleRematch}>
            🔄 Rematch
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={handleNewGame}>
          New Game
        </Button>
      </div>
    </div>
  );
}
