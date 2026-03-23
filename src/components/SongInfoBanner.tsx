interface SongInfoBannerProps {
  title: string;
  artist: string;
  compact?: boolean;
}

export function SongInfoBanner({ title, artist, compact }: SongInfoBannerProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs uppercase tracking-widest opacity-30">Now Playing</span>
        <span className="text-xs font-bold neon-pink">{title}</span>
        <span className="text-xs text-white/30">·</span>
        <span className="text-xs text-white/40">{artist}</span>
      </div>
    );
  }

  return (
    <div className="px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-center">
      <p className="text-xs uppercase tracking-widest opacity-40 mb-0.5">Now Playing</p>
      <p className="text-sm font-bold neon-pink">{title}</p>
      <p className="text-xs text-white/50">{artist}</p>
    </div>
  );
}
