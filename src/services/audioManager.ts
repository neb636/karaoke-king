/**
 * Singleton manager for Web Audio API resources (AudioContext, AnalyserNode, mic stream).
 * Centralizes lifecycle so that multiple hook instances or re-mounts
 * share the same underlying audio resources safely.
 */

let audioCtx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let micStream: MediaStream | null = null;

export function isInitialized(): boolean {
  return audioCtx !== null && micStream !== null;
}

export async function init(): Promise<void> {
  if (audioCtx && micStream) return;

  micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  audioCtx = new AudioContext();
  const source = audioCtx.createMediaStreamSource(micStream);
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.8;
  source.connect(analyser);
}

export function getAnalyser(): AnalyserNode | null {
  return analyser;
}

export function getContext(): AudioContext | null {
  return audioCtx;
}

export function getSampleRate(): number {
  return audioCtx?.sampleRate ?? 44100;
}

export function destroy(): void {
  if (micStream) {
    for (const track of micStream.getTracks()) {
      track.stop();
    }
    micStream = null;
  }
  if (audioCtx) {
    void audioCtx.close();
    audioCtx = null;
  }
  analyser = null;
}
