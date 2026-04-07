/// <reference types="vite/client" />

declare namespace Spotify {
  class Player {
    constructor(options: {
      name: string;
      getOAuthToken: (cb: (token: string) => void) => void;
      volume?: number;
      enableMediaSession?: boolean;
    });
    connect(): Promise<boolean>;
    disconnect(): void;
    addListener(event: "ready" | "not_ready", cb: (data: { device_id: string }) => void): boolean;
    addListener(event: "player_state_changed", cb: (state: PlaybackState | null) => void): boolean;
    addListener(
      event: "initialization_error" | "authentication_error" | "account_error" | "playback_error",
      cb: (data: { message: string }) => void
    ): boolean;
    removeListener(event: string, cb?: (...args: unknown[]) => void): boolean;
    getCurrentState(): Promise<PlaybackState | null>;
    activateElement(): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    seek(position_ms: number): Promise<void>;
    setVolume(volume: number): Promise<void>;
  }

  interface PlaybackState {
    paused: boolean;
    position: number;
    duration: number;
    track_window: {
      current_track: {
        id: string;
        uri: string;
        name: string;
        duration_ms: number;
        artists: { name: string }[];
      };
    };
  }
}

interface Window {
  onSpotifyWebPlaybackSDKReady: () => void;
  Spotify: typeof Spotify;
}
