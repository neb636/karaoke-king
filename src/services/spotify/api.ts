import { SPOTIFY_API_BASE } from "./constants";
import { getStoredToken, refreshAccessToken } from "./auth";

// ── Authenticated fetch with auto-refresh ───────────────────────────────────

async function getValidToken(): Promise<string> {
  const token = getStoredToken();
  if (!token) throw new Error("Not authenticated with Spotify");

  // Refresh if expiring within 60s
  if (Date.now() > token.expires_at - 60_000) {
    const refreshed = await refreshAccessToken(token.refresh_token);
    return refreshed.access_token;
  }

  return token.access_token;
}

async function spotifyFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const accessToken = await getValidToken();

  const res = await fetch(`${SPOTIFY_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  // Handle rate limiting
  if (res.status === 429) {
    const retryAfter = parseInt(res.headers.get("Retry-After") ?? "1", 10);
    await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
    return spotifyFetch(path, options);
  }

  return res;
}

// ── User ────────────────────────────────────────────────────────────────────

export interface SpotifyUser {
  id: string;
  display_name: string;
  product: string; // "premium" | "free" | "open"
  email: string;
  images: { url: string }[];
}

export async function getCurrentUser(): Promise<SpotifyUser> {
  const res = await spotifyFetch("/me");
  if (!res.ok) throw new Error("Failed to get user profile");
  return res.json();
}

// ── Devices ─────────────────────────────────────────────────────────────────

export interface SpotifyDevice {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
  volume_percent: number;
}

export async function getAvailableDevices(): Promise<SpotifyDevice[]> {
  const res = await spotifyFetch("/me/player/devices");
  if (!res.ok) throw new Error("Failed to get devices");
  const data = await res.json();
  return data.devices;
}

export async function transferPlayback(deviceId: string): Promise<void> {
  await spotifyFetch("/me/player", {
    method: "PUT",
    body: JSON.stringify({ device_ids: [deviceId], play: false }),
  });
}

// ── Playback ────────────────────────────────────────────────────────────────

export async function startPlayback(
  spotifyUri: string,
  deviceId?: string,
): Promise<void> {
  const query = deviceId ? `?device_id=${deviceId}` : "";
  const res = await spotifyFetch(`/me/player/play${query}`, {
    method: "PUT",
    body: JSON.stringify({ uris: [spotifyUri] }),
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.text();
    throw new Error(`Playback failed: ${err}`);
  }
}

export async function pausePlayback(): Promise<void> {
  const res = await spotifyFetch("/me/player/pause", { method: "PUT" });
  // 403 = already paused, which is fine
  if (!res.ok && res.status !== 204 && res.status !== 403) {
    throw new Error("Failed to pause");
  }
}

export interface PlaybackState {
  is_playing: boolean;
  progress_ms: number;
  item: {
    uri: string;
    duration_ms: number;
    name: string;
  } | null;
  device: {
    id: string;
    name: string;
    volume_percent: number;
  } | null;
}

export async function getPlaybackState(): Promise<PlaybackState | null> {
  const res = await spotifyFetch("/me/player");
  if (res.status === 204) return null; // no active player
  if (!res.ok) return null;
  return res.json();
}
