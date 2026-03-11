interface SongInfoBannerProps {
  title: string;
  artist: string;
}

export function SongInfoBanner({ title, artist }: SongInfoBannerProps) {
  return (
    <div className="px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-center">
      <p className="text-xs uppercase tracking-widest opacity-40 mb-0.5">Now Playing</p>
      <p className="text-sm font-bold neon-pink">{title}</p>
      <p className="text-xs text-white/50">{artist}</p>
    </div>
  );
}
