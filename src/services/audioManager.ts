/**
 * Singleton manager for Web Audio API resources (AudioContext, AnalyserNode, mic stream).
 * Centralizes lifecycle so that multiple hook instances or re-mounts
 * share the same underlying audio resources safely.
 */

let audioCtx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let micStream: MediaStream | null = null;
let sourceNode: MediaStreamAudioSourceNode | null = null;

export function isInitialized(): boolean {
  return audioCtx !== null && micStream !== null;
}

export async function init(): Promise<void> {
  if (audioCtx && micStream) return;

  let stream: MediaStream | null = null;
  let ctx: AudioContext | null = null;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(stream);
    const node = ctx.createAnalyser();
    node.fftSize = 2048;
    node.smoothingTimeConstant = 0.8;
    source.connect(node);

    micStream = stream;
    audioCtx = ctx;
    analyser = node;
    sourceNode = source;
  } catch (err) {
    // Clean up partial resources so we don't leak the mic stream
    if (stream) {
      for (const track of stream.getTracks()) track.stop();
    }
    if (ctx) void ctx.close();
    throw err;
  }
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
  if (sourceNode) {
    sourceNode.disconnect();
    sourceNode = null;
  }
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
