import { useQuery } from "@tanstack/react-query";
import type { DataFormat } from "@/types/songs";
import { fetchSongExtractedData } from "@/data/songs/songData";

export interface UseSongDataResult {
  extractedData: DataFormat | null;
  isLoading: boolean;
}

export function useSongData(songId: string | null): UseSongDataResult {
  const { data, isLoading } = useQuery({
    queryKey: ["song-data", songId],
    queryFn: () => fetchSongExtractedData(songId!),
    enabled: songId != null,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
  });

  return {
    extractedData: data ?? null,
    isLoading: songId != null && isLoading,
  };
}
