import { useState, useRef, useCallback, useEffect } from "react";
import { initSpotifySDK, onPlaybackStateChange, playTrack, pauseTrack } from "@/services/spotify/sdk";

interface UseSpotifyPlaybackOptions {
  onTrackEnd?: () => void;
}

export function useSpotifyPlayback(options: UseSpotifyPlaybackOptions = {}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPositionMs, setCurrentPositionMs] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onTrackEndRef = useRef(options.onTrackEnd);
  onTrackEndRef.current = options.onTrackEnd;
  const wasPlayingRef = useRef(false);
  // Guards against triggering onTrackEnd before playback has actually started
  const hasStartedRef = useRef(false);

  useEffect(() => {
    initSpotifySDK();

    const unsubscribe = onPlaybackStateChange((state) => {
      if (!state) return;

      const playing = !state.paused;
      setIsPlaying(playing);
      setCurrentPositionMs(state.position);

      if (playing) {
        hasStartedRef.current = true;
      }

      // Track naturally ended: was playing, now paused, position reset to 0
      // (Spotify resets position to 0 on natural track end, not on user pause)
      if (wasPlayingRef.current && !playing && state.position < 500 && hasStartedRef.current) {
        hasStartedRef.current = false;
        wasPlayingRef.current = false;
        onTrackEndRef.current?.();
        return;
      }

      wasPlayingRef.current = playing;
    });

    return unsubscribe;
  }, []);

  const play = useCallback(async (spotifyUri: string) => {
    setError(null);
    hasStartedRef.current = false;
    try {
      await playTrack(spotifyUri);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Playback failed");
    }
  }, []);

  const pause = useCallback(async () => {
    try {
      await pauseTrack();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Pause failed");
    }
  }, []);

  return {
    isPlaying,
    currentPositionMs,
    error,
    play,
    pause,
    setError,
  };
}
