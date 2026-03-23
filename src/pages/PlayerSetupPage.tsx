import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { NeonText } from "@/components/NeonText";
import { Button } from "@/components/ui/button";
import { PlayerRow } from "@/components/PlayerRow";
import { useGameStore } from "@/store/gameStore";
import { loadPlayerNames } from "@/services/playerHistory";
import { MAX_PLAYERS, MIN_PLAYERS } from "@/lib/constants";

type SetupMode = "choose" | "edit";

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

  const [mode, setMode] = useState<SetupMode>("edit");
  const [savedNames, setSavedNames] = useState<string[]>([]);

  useEffect(() => {
    const names = loadPlayerNames();
    if (names.length >= 2) {
      setSavedNames(names);
      setMode("choose");
    }
  }, []);

  function handleReuse() {
    loadSavedPlayers(savedNames);
    setMode("edit");
  }

  function handleFresh() {
    setMode("edit");
  }

  function handleNext() {
    void navigate("/mode");
  }

  const canAdd = players.length < MAX_PLAYERS;
  const canRemove = players.length > MIN_PLAYERS;
  const canProceed = players.every((p) => p.name.trim().length > 0);

  if (mode === "choose") {
    return (
      <div className="screen-container px-5">
        <NeonText as="h2" color="cyan" className="text-[2.2rem] mb-2">
          BACK FOR MORE?
        </NeonText>
        <p className="text-sm uppercase tracking-[3px] opacity-40 mb-8">
          We remember your crew
        </p>

        <div className="flex flex-col gap-4 items-center w-full max-w-[420px]">
          {/* Saved player pills */}
          <div className="flex flex-wrap gap-2.5 justify-center mb-2">
            {savedNames.map((name, i) => (
              <span
                key={i}
                className="px-4 py-2 rounded-full text-sm font-semibold border border-white/20 bg-white/8 text-white/80"
              >
                {name}
              </span>
            ))}
          </div>

          <Button variant="gold" className="w-full" onClick={handleReuse}>
            Play as this crew
          </Button>
          <Button variant="outline" className="w-full" onClick={handleFresh}>
            Start fresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-container overflow-y-auto py-10 px-5">
      <NeonText as="h2" color="cyan" className="text-[2.2rem] mb-6">
        ENTER THE ARENA
      </NeonText>

      <div className="flex flex-col gap-3 items-center w-full max-w-[420px]">
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

        <Button
          variant="gold"
          className="mt-2 w-full"
          onClick={handleNext}
          disabled={!canProceed}
        >
          Let's Go!
        </Button>
      </div>
    </div>
  );
}
