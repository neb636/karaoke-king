import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useSpotifyStore } from "@/store/spotifyStore";
import { NeonText } from "@/components/shared/NeonText";

interface RequireSpotifyProps {
  children: ReactNode;
}

export function RequireSpotify({ children }: RequireSpotifyProps) {
  const { isAuthenticated, isLoading } = useSpotifyStore();

  if (isLoading) {
    return (
      <div className="screen-container">
        <NeonText as="p" color="cyan" className="text-lg animate-pulse">
          Checking Spotify...
        </NeonText>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/spotify-connect" replace />;
  }

  return <>{children}</>;
}
