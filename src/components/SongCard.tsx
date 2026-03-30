import { cn } from "@/lib/utils";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import type { CuratedSong } from "@/types/songs";

interface SongCardProps {
  song: CuratedSong;
  selected: boolean;
  onSelect: () => void;
  thumbnailUrl?: string;
}

export function SongCard({ song, selected, onSelect, thumbnailUrl }: SongCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 rounded-2xl overflow-hidden cursor-pointer select-none text-left",
        "bg-white/[0.04] border-2 border-white/[0.08]",
        "transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02] hover:bg-white/[0.07]",
        "active:scale-[0.98]",
        "p-3 min-h-[80px]",
        selected && "border-[#ff2d95] shadow-[0_0_24px_rgba(255,45,149,0.27)] bg-[rgba(255,45,149,0.1)]",
      )}
    >
      {/* Album art */}
      <div className="relative flex-shrink-0 rounded-xl overflow-hidden bg-white/[0.06]" style={{ width: 100, height: 100 }}>
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={`${song.title} album art`}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 text-lg">
            ♪
          </div>
        )}
      </div>

      {/* Text content */}
      <div className="flex flex-col flex-1 min-w-0 gap-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="font-display text-sm tracking-wide text-white truncate">
              {song.title}
            </div>
            <div className="text-xs text-white/50 truncate">{song.artist}</div>
          </div>
          <DifficultyBadge difficulty={song.difficulty} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-white/[0.08] rounded-full px-2 py-0.5 text-white/60">
            {song.genre}
          </span>
          <span className="text-[10px] text-white/30">{song.year}</span>
        </div>
      </div>
    </button>
  );
}
