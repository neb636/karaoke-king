import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { NeonText } from "@/components/NeonText";
import { Button } from "@/components/ui/button";
import { PlayerRow } from "@/components/PlayerRow";
import { useGameStore } from "@/store/gameStore";
import { loadPlayerNames } from "@/services/playerHistory";
import { MAX_PLAYERS, MIN_PLAYERS } from "@/lib/constants";

export function PlayerSetupPage() {
  const navigate = useNavigate();
  const {
    players,
    addPlayer,
    removePlayer,
    updatePlayerName,
    updatePlayerBumpers,
    loadSavedPlayers,
  } = useGameStore();

  const [savedNames, setSavedNames] = useState<string[]>([]);
  const [showReusePrompt, setShowReusePrompt] = useState(false);

  useEffect(() => {
    const names = loadPlayerNames();
    if (names.length >= 2) {
      setSavedNames(names);
      setShowReusePrompt(true);
    }
  }, []);

  function handleReusePlayers() {
    loadSavedPlayers(savedNames);
    setShowReusePrompt(false);
  }

  function handleNewParty() {
    setShowReusePrompt(false);
  }

  function handleNext() {
    void navigate("/mode");
  }

  const canAdd = players.length < MAX_PLAYERS;
  const canRemove = players.length > MIN_PLAYERS;

  return (
    <div className="screen-container overflow-y-auto py-10 px-5">
      <NeonText as="h2" color="cyan" className="text-[2.2rem] mb-6">
        ENTER THE ARENA
      </NeonText>

      <div className="flex flex-col gap-3 items-center w-full max-w-[420px]">

        {/* Previous party prompt */}
        {showReusePrompt && (
          <div className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-4 flex flex-col gap-3 animate-slide-in">
            <p className="text-sm uppercase tracking-[2px] opacity-60 text-center">
              Previous party found
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {savedNames.map((name, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full text-sm font-semibold bg-white/10 border border-white/20 text-white/80"
                >
                  {name}
                </span>
              ))}
            </div>
            <div className="flex gap-2 mt-1">
              <Button
                variant="cyan"
                size="sm"
                className="flex-1"
                onClick={handleReusePlayers}
              >
                Reuse Party
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleNewParty}
              >
                New Party
              </Button>
            </div>
          </div>
        )}

        <p className="text-xs uppercase tracking-[2px] opacity-40 self-start">
          {players.length} / {MAX_PLAYERS} Players
        </p>

        <div className="flex flex-col gap-2.5 w-full">
          {players.map((player, i) => (
            <PlayerRow
              key={i}
              player={player}
              index={i}
              showRemove={canRemove}
              onNameChange={(name) => updatePlayerName(i, name)}
              onBumpersChange={(bumpers) => updatePlayerBumpers(i, bumpers)}
              onRemove={() => removePlayer(i)}
            />
          ))}
        </div>

        <div className="flex gap-3 mt-1">
          <Button
            variant="cyan"
            size="sm"
            onClick={addPlayer}
            disabled={!canAdd}
            className={!canAdd ? "opacity-30 pointer-events-none" : ""}
          >
            + Add Player
          </Button>
        </div>

        <Button variant="gold" className="mt-2 w-full" onClick={handleNext}>
          Let's Go!
        </Button>
      </div>
    </div>
  );
}
