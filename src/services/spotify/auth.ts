import {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_REDIRECT_URI,
  SPOTIFY_SCOPES,
  SPOTIFY_AUTH_URL,
  SPOTIFY_TOKEN_URL,
} from "./constants";

const STORAGE_KEY = "karaoke-king-spotify-token";
const VERIFIER_KEY = "karaoke-king-spotify-verifier";

export interface SpotifyToken {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

// ── PKCE helpers ────────────────────────────────────────────────────────────

function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(36).padStart(2, "0"))
    .join("")
    .slice(0, length);
}

export function generateCodeVerifier(): string {
  return generateRandomString(64);
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// ── Auth URL ────────────────────────────────────────────────────────────────

export async function buildAuthUrl(): Promise<string> {
  const verifier = generateCodeVerifier();
  sessionStorage.setItem(VERIFIER_KEY, verifier);
  const challenge = await generateCodeChallenge(verifier);

  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: "code",
    redirect_uri: SPOTIFY_REDIRECT_URI,
    scope: SPOTIFY_SCOPES,
    code_challenge_method: "S256",
    code_challenge: challenge,
  });

  return `${SPOTIFY_AUTH_URL}?${params.toString()}`;
}

// ── Token exchange ──────────────────────────────────────────────────────────

export async function exchangeCodeForToken(code: string): Promise<SpotifyToken> {
  const verifier = sessionStorage.getItem(VERIFIER_KEY);
  if (!verifier) throw new Error("No code verifier found");

  const body = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    grant_type: "authorization_code",
    code,
    redirect_uri: SPOTIFY_REDIRECT_URI,
    code_verifier: verifier,
  });

  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${err}`);
  }

  const data = await res.json();
  const token: SpotifyToken = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };

  storeToken(token);
  sessionStorage.removeItem(VERIFIER_KEY);
  return token;
}

// ── Token refresh ───────────────────────────────────────────────────────────

export async function refreshAccessToken(refreshToken: string): Promise<SpotifyToken> {
  const body = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    clearToken();
    throw new Error("Token refresh failed");
  }

  const data = await res.json();
  const token: SpotifyToken = {
    access_token: data.access_token,
    refresh_token: data.refresh_token ?? refreshToken,
    expires_at: Date.now() + data.expires_in * 1000,
  };

  storeToken(token);
  return token;
}

// ── Token persistence ───────────────────────────────────────────────────────

export function getStoredToken(): SpotifyToken | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SpotifyToken;
  } catch {
    return null;
  }
}

function storeToken(token: SpotifyToken): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(token));
}

export function clearToken(): void {
  localStorage.removeItem(STORAGE_KEY);
}
