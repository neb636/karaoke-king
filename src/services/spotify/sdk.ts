import { getValidToken, startPlayback } from "./api";

// ── Singleton state ──────────────────────────────────────────────────────────

let player: Spotify.Player | null = null;
let deviceId: string | null = null;

// Resolves once the browser player has registered with Spotify
let resolveDeviceReady: ((id: string) => void) | null = null;
const deviceReadyPromise = new Promise<string>((resolve) => {
  resolveDeviceReady = resolve;
});

type StateListener = (state: Spotify.PlaybackState | null) => void;
const stateListeners = new Set<StateListener>();

function createPlayer(): void {
  if (player) return;

  player = new window.Spotify.Player({
    name: "Karaoke King",
    getOAuthToken: (cb) => {
      getValidToken()
        .then(cb)
        .catch(() => cb(""));
    },
    volume: 1.0,
  });

  player.addListener("ready", ({ device_id }) => {
    deviceId = device_id;
    resolveDeviceReady?.(device_id);
  });

  player.addListener("not_ready", () => {
    deviceId = null;
  });

  player.addListener("player_state_changed", (state) => {
    stateListeners.forEach((fn) => fn(state));
  });

  player.addListener("initialization_error", ({ message }) => {
    console.error("[Spotify SDK] Initialization error:", message);
  });
  player.addListener("authentication_error", ({ message }) => {
    console.error("[Spotify SDK] Authentication error:", message);
  });
  player.addListener("account_error", ({ message }) => {
    console.error("[Spotify SDK] Account error (Premium required):", message);
  });

  void player.connect();
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Call once after Spotify auth succeeds. Idempotent — safe to call multiple times.
 * Sets up the browser as a virtual Spotify playback device.
 */
export function initSpotifySDK(): void {
  if (window.Spotify) {
    createPlayer();
  } else {
    window.onSpotifyWebPlaybackSDKReady = createPlayer;
  }
}

/** Returns the Spotify player instance (for position polling). */
export function getPlayer(): Spotify.Player | null {
  return player;
}

/** Subscribe to SDK playback state changes. Returns an unsubscribe function. */
export function onPlaybackStateChange(listener: StateListener): () => void {
  stateListeners.add(listener);
  return () => stateListeners.delete(listener);
}

/**
 * Play a Spotify URI in the browser. Handles activating the element for
 * browser autoplay policy and targeting the browser device.
 */
export async function playTrack(spotifyUri: string): Promise<void> {
  const id = deviceId ?? (await deviceReadyPromise);
  if (!player) throw new Error("Spotify player not ready");
  await player.activateElement();
  await startPlayback(spotifyUri, id);
}

/** Pause the in-browser Spotify player. */
export async function pauseTrack(): Promise<void> {
  await player?.pause();
}
