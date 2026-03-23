import { useCallback } from "react";

const COLORS = [
  "#ff2d95",
  "#00e5ff",
  "#ffd700",
  "#ff6ec7",
  "#00b8d4",
  "#ff3b3b",
  "#a855f7",
  "#39ff14",
];

export function useConfetti() {
  const spawn = useCallback(() => {
    const fragment = document.createDocumentFragment();
    const removals: Array<{ el: HTMLDivElement; removeAt: number }> = [];

    for (let i = 0; i < 100; i++) {
      const piece = document.createElement("div");
      const size = 6 + Math.random() * 8;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]!;
      const dur = 2 + Math.random() * 3;
      const delay = Math.random() * 1.5;

      Object.assign(piece.style, {
        position: "fixed",
        width: `${size}px`,
        height: `${size}px`,
        left: `${Math.random() * 100}vw`,
        top: "-20px",
        background: color,
        borderRadius: Math.random() > 0.5 ? "50%" : "2px",
        zIndex: "100",
        opacity: "0",
        animation: `confetti-fall ${dur}s linear ${delay}s forwards`,
        pointerEvents: "none",
        willChange: "transform, opacity",
      });

      fragment.appendChild(piece);
      removals.push({ el: piece, removeAt: (dur + delay + 0.5) * 1000 });
    }

    // Single DOM insertion for all 100 pieces
    document.body.appendChild(fragment);

    for (const { el, removeAt } of removals) {
      setTimeout(() => el.remove(), removeAt);
    }
  }, []);

  return { spawn };
}
