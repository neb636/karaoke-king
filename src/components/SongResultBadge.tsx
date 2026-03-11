import { DifficultyBadge } from "@/components/DifficultyBadge";
import type { CuratedSong } from "@/types/songs";

interface SongResultBadgeProps {
  song: CuratedSong;
  isNewBest: boolean;
}

export function SongResultBadge({ song, isNewBest }: SongResultBadgeProps) {
  return (
    <div className="text-center space-y-1">
      <div className="flex items-center justify-center gap-2">
        <span className="text-sm font-bold text-white/80">{song.title}</span>
        <DifficultyBadge difficulty={song.difficulty} />
      </div>
      <p className="text-xs text-white/40">{song.artist}</p>
      {isNewBest && (
        <p className="text-xs font-bold neon-gold animate-glow-pulse">
          NEW PERSONAL BEST!
        </p>
      )}
    </div>
  );
}
