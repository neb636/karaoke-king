import { cn } from "@/lib/utils";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import type { CuratedSong } from "@/types/songs";

interface SongCardProps {
  song: CuratedSong;
  selected: boolean;
  onSelect: () => void;
}

export function SongCard({ song, selected, onSelect }: SongCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex flex-col items-start gap-1.5 rounded-2xl cursor-pointer select-none text-left",
        "bg-white/[0.04] border-2 border-white/[0.08]",
        "transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02] hover:bg-white/[0.07]",
        "active:scale-[0.98]",
        "p-4 min-h-[100px]",
        selected && "border-[#ff2d95] shadow-[0_0_24px_rgba(255,45,149,0.27)] bg-[rgba(255,45,149,0.1)]",
      )}
    >
      <div className="flex items-start justify-between w-full gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-display text-sm tracking-wide text-white truncate">
            {song.title}
          </div>
          <div className="text-xs text-white/50 truncate">{song.artist}</div>
        </div>
        <DifficultyBadge difficulty={song.difficulty} />
      </div>
      <div className="flex items-center gap-2 mt-auto">
        <span className="text-[10px] bg-white/[0.08] rounded-full px-2 py-0.5 text-white/60">
          {song.genre}
        </span>
        <span className="text-[10px] text-white/30">{song.year}</span>
      </div>
    </button>
  );
}
