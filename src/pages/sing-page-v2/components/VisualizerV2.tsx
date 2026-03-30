import { memo, useEffect, useRef, useCallback } from "react";

const BAR_COUNT = 32;

// Pre-compute hues: magenta → purple → pink (300° → 360°)
const BAR_HUES = Array.from(
  { length: BAR_COUNT },
  (_, i) => 300 + (i / BAR_COUNT) * 60,
);

interface VisualizerV2Props {
  freqArray: React.MutableRefObject<Uint8Array>;
  isActive: boolean;
}

export const VisualizerV2 = memo(function VisualizerV2({
  freqArray,
  isActive,
}: VisualizerV2Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const rafRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const freq = freqArray.current;
    if (!canvas || freq.length === 0) return;

    let ctx = ctxRef.current;
    if (!ctx) {
      ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctxRef.current = ctx;
    }

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const barW = W / BAR_COUNT;
    const step = Math.max(1, Math.floor(freq.length / BAR_COUNT));
    const radius = Math.min(barW * 0.3, 4);

    for (let i = 0; i < BAR_COUNT; i++) {
      const val = (freq[i * step] ?? 0) / 255;
      const barH = val * H * 0.9;
      if (barH < 1) continue; // Skip invisible bars

      const alpha = 0.4 + val * 0.6;
      ctx.fillStyle = `hsla(${BAR_HUES[i]},100%,60%,${alpha})`;

      const x = i * barW + 1;
      const w = barW - 2;
      const r = Math.min(radius, barH / 2, w / 2);

      ctx.beginPath();
      ctx.roundRect(x, H - barH, w, barH, r);
      ctx.fill();
    }
  }, [freqArray]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Resize canvas to match CSS size at device pixel ratio
    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio ?? 1, 2); // Cap at 2x for perf
      const cssW = parent.clientWidth;
      const cssH = parent.clientHeight;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      ctxRef.current = null; // force re-acquire after resize
    };

    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    if (!isActive) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      return () => ro.disconnect();
    }

    const loop = () => {
      draw();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [isActive, draw]);

  return (
    <div className="w-full h-[52px] sm:h-14 relative rounded-xl overflow-hidden bg-white/[0.02]">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
});
