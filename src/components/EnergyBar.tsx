interface EnergyBarProps {
  percent: number; // 0-100
}

export function EnergyBar({ percent }: EnergyBarProps) {
  return (
    <div className="w-full max-w-md h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#ff2d95] via-[#ff6ec7] to-[#ffd700] transition-[width] duration-100"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
