import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
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
import { PLAYER_COLORS } from "@/lib/constants";

export function SongSelectPage() {
  const navigate = useNavigate();
  const {
    selectedRegion, setRegion, selectedSongId, selectSong,
    getRegionSongs, pickingPlayer, selectSongForPlayer, setPickingPlayer,
  } = useSongStore();
  const { isAuthenticated, isPremium } = useSpotifyStore();
  const { players } = useGameStore();
  const [search, setSearch] = useState("");

  const songs = getRegionSongs();
  const region = REGIONS[selectedRegion];

  const player = players[pickingPlayer];
  const playerColor = PLAYER_COLORS[pickingPlayer % PLAYER_COLORS.length]!;
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

  function handleConfirmSong() {
    if (!canConfirm || !selectedSongId) return;
    selectSongForPlayer(pickingPlayer, selectedSongId);

    const nextPlayer = pickingPlayer + 1;
    if (nextPlayer < players.length) {
      setPickingPlayer(nextPlayer);
      setSearch("");
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
            color={playerColor.name as "pink" | "cyan" | "gold" | "green"}
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

      <RegionPicker selected={selectedRegion} onChange={setRegion} />

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
        {!isAuthenticated && selectedSongId && (
          <p className="text-xs text-[#ff2d95] opacity-80">Connect Spotify to start singing</p>
        )}
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
      </div>
    </div>
  );
}
