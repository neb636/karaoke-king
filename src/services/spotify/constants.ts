export const SPOTIFY_CLIENT_ID = (import.meta.env.VITE_SPOTIFY_CLIENT_ID as string) ?? "";

export const SPOTIFY_REDIRECT_URI = `${window.location.origin}${import.meta.env.BASE_URL ?? "/"}spotify-callback`;

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
