import { useState, useRef, useCallback, useEffect } from "react";
import {
  startPlayback,
  pausePlayback,
  getPlaybackState,
  getAvailableDevices,
  type SpotifyDevice,
} from "@/services/spotify/api";

interface UseSpotifyPlaybackOptions {
  onTrackEnd?: () => void;
}

export function useSpotifyPlayback(options: UseSpotifyPlaybackOptions = {}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPositionMs, setCurrentPositionMs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<SpotifyDevice[]>([]);
  const [needsDevice, setNeedsDevice] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wasPlayingRef = useRef(false);
  const onTrackEndRef = useRef(options.onTrackEnd);
  onTrackEndRef.current = options.onTrackEnd;

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const state = await getPlaybackState();
        if (!state) return;

        setCurrentPositionMs(state.progress_ms);
        setIsPlaying(state.is_playing);

        // Detect track end: was playing, now stopped
        if (wasPlayingRef.current && !state.is_playing) {
          stopPolling();
          onTrackEndRef.current?.();
        }
        wasPlayingRef.current = state.is_playing;
      } catch {
        // Silently handle polling errors
      }
    }, 1000);
  }, [stopPolling]);

  const play = useCallback(
    async (spotifyUri: string, deviceId?: string) => {
      setError(null);
      try {
        await startPlayback(spotifyUri, deviceId);
        setIsPlaying(true);
        wasPlayingRef.current = true;
        startPolling();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Playback failed";
        // Check if it's a "no active device" error
        if (msg.includes("NO_ACTIVE_DEVICE") || msg.includes("Not found")) {
          setNeedsDevice(true);
          try {
            const devs = await getAvailableDevices();
            setDevices(devs);
          } catch {
            // ignore
          }
        }
        setError(msg);
      }
    },
    [startPolling],
  );

  const pause = useCallback(async () => {
    try {
      await pausePlayback();
      setIsPlaying(false);
      stopPolling();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Pause failed");
    }
  }, [stopPolling]);

  const refreshDevices = useCallback(async () => {
    try {
      const devs = await getAvailableDevices();
      setDevices(devs);
      setNeedsDevice(devs.length === 0);
    } catch {
      setDevices([]);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    isPlaying,
    currentPositionMs,
    error,
    devices,
    needsDevice,
    play,
    pause,
    refreshDevices,
    setNeedsDevice,
    setError,
  };
}
