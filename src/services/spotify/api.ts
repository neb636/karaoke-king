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

// ── Tracks ──────────────────────────────────────────────────────────────────

export interface SpotifyTrack {
  id: string;
  uri: string;
  is_playable?: boolean;
  restrictions?: { reason: string };
  album: {
    images: { url: string; width: number; height: number }[];
  };
}

/**
 * Fetch up to 50 tracks by their Spotify URIs.
 * Includes market=from_token so Spotify returns accurate is_playable status
 * for the authenticated user's market.
 * Returns a map of URI → SpotifyTrack for easy lookup.
 */
export async function getTracksByUris(
  uris: string[],
): Promise<Map<string, SpotifyTrack>> {
  const ids = uris.map((uri) => uri.split(":")[2]).filter(Boolean);
  if (ids.length === 0) return new Map();

  const result = new Map<string, SpotifyTrack>();

  // Spotify /tracks endpoint accepts up to 50 IDs per request
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += 50) {
    chunks.push(ids.slice(i, i + 50));
  }

  for (const chunk of chunks) {
    const res = await spotifyFetch(`/tracks?ids=${chunk.join(",")}&market=from_token`);
    if (!res.ok) continue;
    const data = (await res.json()) as { tracks: (SpotifyTrack | null)[] };
    for (let i = 0; i < chunk.length; i++) {
      const track = data.tracks[i];
      if (track) {
        result.set(`spotify:track:${chunk[i]}`, track);
      }
    }
  }

  return result;
}


// ── Playback ────────────────────────────────────────────────────────────────

export async function startPlayback(
  spotifyUri: string,
  deviceId: string,
): Promise<void> {
  const res = await spotifyFetch(`/me/player/play?device_id=${deviceId}`, {
    method: "PUT",
    body: JSON.stringify({ uris: [spotifyUri] }),
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.text();
    throw new Error(`Playback failed: ${err}`);
  }
}
