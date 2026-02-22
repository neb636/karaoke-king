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
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };
    resizeCanvas();

    if (!isActive) {
      // Clear canvas when not active
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      return;
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
    };
  }, [isActive, freqArray, draw]);

  return (
    <div className="w-full max-w-[600px] h-40 relative rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.06]">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
