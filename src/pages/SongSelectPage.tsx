import { useState, useMemo, useEffect } from "react";
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
import { useSpotifyThumbnails } from "@/hooks/useSpotifyThumbnails";
import type { RegionId } from "@/types/songs";

export function SongSelectPage() {
  const navigate = useNavigate();
  const {
    selectedRegions, toggleRegion, selectedSongId, selectSong,
    getRegionSongs, selectSongForPlayer,
  } = useSongStore();
  const { isAuthenticated, isPremium } = useSpotifyStore();
  const { players, currentPlayer, currentRound, totalRounds } = useGameStore();
  const [search, setSearch] = useState("");

  // Clear selection when this page mounts (fresh pick for each player)
  useEffect(() => {
    selectSong(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const songs = getRegionSongs();
  const { thumbnails, unavailable } = useSpotifyThumbnails(songs, isAuthenticated);

  const player = players[currentPlayer];
  const playerName = player?.name || `Player ${currentPlayer + 1}`;

  const filtered = useMemo(() => {
    const available = songs.filter((s) => !unavailable.has(s.spotifyUri));
    if (!search.trim()) return available;
    const q = search.toLowerCase();
    return available.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.genre.toLowerCase().includes(q),
    );
  }, [songs, search, unavailable]);

  const canConfirm = selectedSongId && isAuthenticated && isPremium;

  const confirmHint = useMemo(() => {
    if (!selectedSongId) return "Select a song to continue";
    if (!isAuthenticated) return "Connect Spotify to pick your song";
    if (!isPremium) return null;
    return null;
  }, [selectedSongId, isAuthenticated, isPremium]);

  function handleRegionToggle(region: RegionId) {
    toggleRegion(region);
  }

  function handleConfirmSong() {
    if (!canConfirm || !selectedSongId) return;
    selectSongForPlayer(currentPlayer, selectedSongId);
    void navigate("/sing");
  }

  const roundLabel = totalRounds > 1
    ? `Round ${currentRound} of ${totalRounds} · `
    : "";

  const regionLabel = selectedRegions.length === 0
    ? "All Regions"
    : selectedRegions.length === 1
      ? (selectedRegions[0] as string)
      : `${selectedRegions.length} regions`;

  return (
    <div className="screen-container overflow-y-auto justify-start py-6 px-4 gap-4">
      <div className="flex items-center justify-between w-full max-w-[900px]">
        <div>
          <NeonText
            as="h2"
            color="cyan"
            className="text-[clamp(1.3rem,3.5vw,2.5rem)]"
          >
            {playerName.toUpperCase()}, PICK YOUR SONG
          </NeonText>
          <p className="text-xs opacity-40 tracking-wider mt-1">
            {roundLabel}Singer {currentPlayer + 1} of {players.length} &middot; {filtered.length} songs &middot; {regionLabel}
          </p>
        </div>
        <SpotifyAuthButton />
      </div>

      <RegionPicker selected={selectedRegions} onToggle={handleRegionToggle} />

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
            thumbnailUrl={thumbnails.get(song.spotifyUri)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm opacity-40 mt-4">No songs match your search.</p>
      )}

      <div className="sticky bottom-0 bg-gradient-to-t from-[#0a0a1a] via-[#0a0a1a] to-transparent pt-6 pb-4 w-full max-w-[900px] flex flex-col items-center gap-2">
        {confirmHint && (
          <p className="text-xs text-white/50 tracking-wide">{confirmHint}</p>
        )}
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
              🎤 Sing This!
            </Button>
          </div>
        )}
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
