import { useCallback, useRef } from "react";

const BAR_COUNT = 64;

// Pre-compute the fixed hue per bar so we don't recalculate each frame
const BAR_HUES = Array.from(
  { length: BAR_COUNT },
  (_, i) => 300 + (i / BAR_COUNT) * 60,
);

export function useVisualizer() {
  // Cache the 2D context so we don't look it up every frame
  const ctxCache = useRef<{ canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null>(null);

  const draw = useCallback(
    (canvas: HTMLCanvasElement, freqArray: Uint8Array) => {
      let ctx: CanvasRenderingContext2D;
      if (ctxCache.current?.canvas === canvas) {
        ctx = ctxCache.current.ctx;
      } else {
        const acquired = canvas.getContext("2d");
        if (!acquired) return;
        ctx = acquired;
        ctxCache.current = { canvas, ctx };
      }

      // canvas.width/height are already in physical pixels (set by resizeCanvas)
      // Work directly in physical pixels — no save/restore/scale needed
      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      const barW = W / BAR_COUNT;
      const step = Math.floor(freqArray.length / BAR_COUNT);
      const radius = barW * 0.3;

      for (let i = 0; i < BAR_COUNT; i++) {
        const val = (freqArray[i * step] ?? 0) / 255;
        const barH = val * H * 0.9;
        if (barH < 1) continue;

        const alpha = 0.4 + val * 0.6;
        ctx.fillStyle = `hsla(${BAR_HUES[i]}, 100%, 60%, ${alpha})`;

        const x = i * barW + 1;
        const y = H - barH;
        const w = barW - 2;
        const r = Math.min(radius, barH / 2, w / 2);

        ctx.beginPath();
        ctx.roundRect(x, y, w, barH, r);
        ctx.fill();
      }
    },
    [],
  );

  return { draw };
}
