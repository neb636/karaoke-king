const STORAGE_KEY = "karaoke-king-song-history";

interface SongRecord {
  bestScore: number;
  playCount: number;
  lastPlayed: string; // ISO date
}

type SongHistory = Record<string, SongRecord>;

function getHistory(): SongHistory {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SongHistory) : {};
  } catch {
    return {};
  }
}

function saveHistory(history: SongHistory): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function saveSongScore(songId: string, score: number): boolean {
  const history = getHistory();
  const existing = history[songId];
  const isNewBest = !existing || score > existing.bestScore;

  history[songId] = {
    bestScore: isNewBest ? score : existing!.bestScore,
    playCount: (existing?.playCount ?? 0) + 1,
    lastPlayed: new Date().toISOString(),
  };

  saveHistory(history);
  return isNewBest;
}

export function getSongBest(songId: string): SongRecord | null {
  const history = getHistory();
  return history[songId] ?? null;
}
