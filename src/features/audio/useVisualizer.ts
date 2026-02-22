import { useCallback } from "react";

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  if (h < 1) return;
  r = Math.min(r, h / 2, w / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.fill();
}

export function useVisualizer() {
  const draw = useCallback(
    (canvas: HTMLCanvasElement, freqArray: Uint8Array) => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      const barCount = 64;
      const barW = W / barCount;
      const step = Math.floor(freqArray.length / barCount);

      for (let i = 0; i < barCount; i++) {
        const val = (freqArray[i * step] ?? 0) / 255;
        const barH = val * H * 0.9;
        const hue = 300 + (i / barCount) * 60; // pink → purple
        const alpha = 0.4 + val * 0.6;
        ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${alpha})`;
        const x = i * barW;
        roundedRect(ctx, x + 1, H - barH, barW - 2, barH, barW * 0.3);
      }
    },
    [],
  );

  return { draw };
}
