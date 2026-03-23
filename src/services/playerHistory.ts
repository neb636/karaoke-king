const STORAGE_KEY = "karaoke-king-players";

export function savePlayerNames(names: string[]): void {
  const nonEmpty = names.filter((n) => n.trim().length > 0);
  if (nonEmpty.length === 0) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nonEmpty));
  } catch {
    // storage unavailable — silently ignore
  }
}

export function loadPlayerNames(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  } catch {
    return [];
  }
}

export function clearPlayerNames(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
