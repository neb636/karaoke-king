export const SPOTIFY_CLIENT_ID = (import.meta.env.VITE_SPOTIFY_CLIENT_ID as string) ?? "";

// In production (GitHub Pages), redirect lands on the same origin's callback route.
// For local dev, set VITE_SPOTIFY_REDIRECT_URI in .env.local to point to the
// deployed GitHub Pages callback page — Spotify rejects http:// redirect URIs,
// so we redirect there and paste the auth code back manually.
//
// .env.local example:
//   VITE_SPOTIFY_REDIRECT_URI=https://neb636.github.io/karaoke-king/oauth-callback.html

const redirectOverride = import.meta.env.VITE_SPOTIFY_REDIRECT_URI as string | undefined;

export const SPOTIFY_REDIRECT_URI =
  redirectOverride || `${window.location.origin}${import.meta.env.BASE_URL ?? "/"}spotify-callback`;

export const USE_CODE_PASTE_FLOW = !!redirectOverride;

export const SPOTIFY_SCOPES = [
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-modify-playback-state",
  "user-read-playback-state",
].join(" ");

export const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
export const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
export const SPOTIFY_API_BASE = "https://api.spotify.com/v1";
