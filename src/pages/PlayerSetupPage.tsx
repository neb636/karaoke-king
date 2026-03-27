import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
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
    updatePlayerEmoji,
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
  const allNamed = players.every((p) => p.name.trim().length > 0);
  const allHaveEmoji = players.every((p) => p.emoji.length > 0);
  const canProceed = allNamed && allHaveEmoji;

  if (mode === "choose") {
    return (
      <div className="screen-container px-5">
        {/* Back to title */}
        <button
          onClick={() => void navigate("/")}
          className="absolute top-4 left-4 flex items-center gap-1.5 text-white/40 hover:text-white/80 transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          <span className="tracking-wide">Home</span>
        </button>

        <NeonText as="h2" color="cyan" className="text-[2.2rem] mb-2">
          BACK FOR MORE?
        </NeonText>
        <p className="text-sm uppercase tracking-[3px] opacity-40 mb-2">
          We remember your crew
        </p>
        <p className="text-xs text-white/50 mb-6">
          {savedNames.length} player{savedNames.length !== 1 ? "s" : ""} returning
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
      {/* Back to title */}
      <button
        onClick={() => void navigate("/")}
        className="absolute top-4 left-4 flex items-center gap-1.5 text-white/40 hover:text-white/80 transition-colors text-sm"
      >
        <ArrowLeft size={16} />
        <span className="tracking-wide">Home</span>
      </button>

      <NeonText as="h2" color="cyan" className="text-[2.2rem] mb-2">
        ENTER THE ARENA
      </NeonText>
      <p className="text-xs uppercase tracking-[2px] opacity-40 mb-6">
        Pick your emoji &amp; enter your name
      </p>

      <div className="flex flex-col gap-3 items-center w-full max-w-[420px]">
        <p className="text-xs uppercase tracking-[2px] opacity-60 self-start font-semibold">
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
              onEmojiChange={(emoji) => updatePlayerEmoji(i, emoji)}
              onBumpersChange={(bumpers) => updatePlayerBumpers(i, bumpers)}
              onRemove={() => removePlayer(i)}
            />
          ))}
        </div>

        {canAdd && (
          <button
            onClick={addPlayer}
            className="w-full py-2.5 rounded-2xl border-2 border-dashed border-white/15 text-white/40 hover:border-[#00e5ff]/40 hover:text-[#00e5ff]/70 transition-all duration-200 text-sm font-semibold tracking-wide"
          >
            + Add Player
          </button>
        )}

        <Button
          variant="gold"
          className="mt-1 w-full"
          onClick={handleNext}
          disabled={!canProceed}
        >
          Let&apos;s Go!
        </Button>
      </div>
    </div>
  );
}
