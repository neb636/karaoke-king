import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { Check } from "lucide-react";
import { NeonText } from "@/components/NeonText";
import { Button } from "@/components/ui/button";
import { SongCard } from "@/components/SongCard";
import { RegionPicker } from "@/components/RegionPicker";
import { SpotifyAuthButton } from "@/components/SpotifyAuthButton";
import { SpotifyPremiumGate } from "@/components/SpotifyPremiumGate";
import { useSongStore } from "@/store/songStore";
import { useSpotifyStore } from "@/store/spotifyStore";
import { useGameStore } from "@/store/gameStore";
import { REGIONS } from "@/data/songs/regions";
import type { RegionId } from "@/types/songs";

export function SongSelectPage() {
  const navigate = useNavigate();
  const {
    selectedRegion, setRegion, selectedSongId, selectSong,
    getRegionSongs, pickingPlayer, selectSongForPlayer, setPickingPlayer,
    playerSongIds,
  } = useSongStore();
  const { isAuthenticated, isPremium } = useSpotifyStore();
  const { players } = useGameStore();
  const [search, setSearch] = useState("");
  const [regionChangedClear, setRegionChangedClear] = useState(false);

  const songs = getRegionSongs();
  const region = REGIONS[selectedRegion];

  const player = players[pickingPlayer];
  const playerName = player?.name || `Player ${pickingPlayer + 1}`;

  const filtered = useMemo(() => {
    if (!search.trim()) return songs;
    const q = search.toLowerCase();
    return songs.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.genre.toLowerCase().includes(q),
    );
  }, [songs, search]);

  const canConfirm = selectedSongId && isAuthenticated && isPremium;

  // Derive a human-readable hint for why confirm is disabled
  const confirmHint = useMemo(() => {
    if (!selectedSongId) return "Select a song to continue";
    if (!isAuthenticated) return "Connect Spotify to lock in your song";
    if (!isPremium) return null; // SpotifyPremiumGate handles this case
    return null;
  }, [selectedSongId, isAuthenticated, isPremium]);

  function handleRegionChange(region: RegionId) {
    if (selectedSongId) {
      setRegionChangedClear(true);
    }
    setRegion(region);
  }

  // Auto-clear the "region changed" notice after 3s
  useEffect(() => {
    if (!regionChangedClear) return;
    const t = setTimeout(() => setRegionChangedClear(false), 3000);
    return () => clearTimeout(t);
  }, [regionChangedClear]);

  function handleConfirmSong() {
    if (!canConfirm || !selectedSongId) return;
    selectSongForPlayer(pickingPlayer, selectedSongId);

    const nextPlayer = pickingPlayer + 1;
    if (nextPlayer < players.length) {
      setPickingPlayer(nextPlayer);
      setSearch("");
      setRegionChangedClear(false);
    } else {
      void navigate("/sing");
    }
  }

  return (
    <div className="screen-container overflow-y-auto justify-start py-6 px-4 gap-4">
      <div className="flex items-center justify-between w-full max-w-[900px]">
        <div>
          <NeonText
            as="h2"
            color="cyan"
            className="text-[clamp(1.3rem,3.5vw,2.5rem)]"
          >
            {region.flag} {playerName.toUpperCase()}, PICK YOUR SONG
          </NeonText>
          <p className="text-xs opacity-40 tracking-wider mt-1">
            Player {pickingPlayer + 1} of {players.length} &middot; {songs.length} songs in {region.label}
          </p>
        </div>
        <SpotifyAuthButton />
      </div>

      {/* Player progress stepper */}
      {players.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap justify-center w-full max-w-[900px]">
          {players.map((p, i) => {
            const isLocked = !!playerSongIds[i];
            const isCurrent = i === pickingPlayer;
            const isPending = !isLocked && !isCurrent;
            return (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={[
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300",
                    isLocked
                      ? "bg-[#00e5ff]/10 border-[#00e5ff]/40 text-[#00e5ff]"
                      : isCurrent
                        ? "bg-[#ff2d95]/10 border-[#ff2d95]/60 text-white animate-pulse"
                        : "bg-white/[0.03] border-white/10 text-white/30",
                  ].join(" ")}
                >
                  {isLocked ? (
                    <Check size={10} strokeWidth={3} />
                  ) : (
                    <span className={[
                      "w-1.5 h-1.5 rounded-full inline-block",
                      isCurrent ? "bg-[#ff2d95]" : "bg-white/20",
                    ].join(" ")} />
                  )}
                  <span className={isPending ? "opacity-40" : ""}>
                    {p.name || `Player ${i + 1}`}
                  </span>
                </div>
                {i < players.length - 1 && (
                  <span className="text-white/15 text-xs">›</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      <RegionPicker selected={selectedRegion} onChange={handleRegionChange} />

      {regionChangedClear && (
        <p className="text-xs text-[#ffd700]/70 -mt-1 tracking-wide">
          Song selection cleared — pick one from {region.label}
        </p>
      )}

      <div className="w-full max-w-[900px]">
        <input
          type="text"
          placeholder="Search songs, artists, genres..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#ff2d95]/50 transition-colors"
        />
      </div>

      {isAuthenticated && !isPremium && <SpotifyPremiumGate />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-[900px]">
        {filtered.map((song) => (
          <SongCard
            key={song.id}
            song={song}
            selected={selectedSongId === song.id}
            onSelect={() => selectSong(song.id)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm opacity-40 mt-4">No songs match your search.</p>
      )}

      <div className="sticky bottom-0 bg-gradient-to-t from-[#0a0a1a] via-[#0a0a1a] to-transparent pt-6 pb-4 w-full max-w-[900px] flex flex-col items-center gap-2">
        {/* Contextual hint for disabled confirm button */}
        {confirmHint && (
          <p className="text-xs text-white/50 tracking-wide">{confirmHint}</p>
        )}
        {/* Only show confirm button if premium (or not yet authenticated) */}
        {!(isAuthenticated && !isPremium) && (
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void navigate("/mode")}
            >
              Back
            </Button>
            <Button
              variant="pink"
              onClick={handleConfirmSong}
              disabled={!canConfirm}
              className={!canConfirm ? "opacity-40 cursor-not-allowed" : ""}
            >
              🎤 {pickingPlayer < players.length - 1
                ? `Lock In & Next Player`
                : `Lock In & Sing!`}
            </Button>
          </div>
        )}
        {/* If premium gate is showing, still show a Back button */}
        {isAuthenticated && !isPremium && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => void navigate("/mode")}
          >
            Back to Mode Select
          </Button>
        )}
      </div>
    </div>
  );
}
