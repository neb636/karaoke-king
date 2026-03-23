import { useEffect, useRef } from "react";
import { useVisualizer } from "@/features/audio/useVisualizer";

interface AudioVisualizerProps {
  freqArray: React.MutableRefObject<Uint8Array>;
  isActive: boolean;
}

export function AudioVisualizer({ freqArray, isActive }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { draw } = useVisualizer();
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio ?? 1;
      const cssW = parent.clientWidth;
      const cssH = parent.clientHeight;
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
    };

    resizeCanvas();

    const ro = new ResizeObserver(resizeCanvas);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    if (!isActive) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      return () => ro.disconnect();
    }

    const loop = () => {
      if (canvas && freqArray.current.length > 0) {
        draw(canvas, freqArray.current);
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [isActive, freqArray, draw]);

  return (
    <div className="w-full max-w-[600px] h-28 relative rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.06]">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
