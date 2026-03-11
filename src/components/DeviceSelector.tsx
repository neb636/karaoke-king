import { Button } from "@/components/ui/button";
import type { SpotifyDevice } from "@/services/spotify/api";

interface DeviceSelectorProps {
  devices: SpotifyDevice[];
  onSelect: (deviceId: string) => void;
  onRefresh: () => void;
  onDismiss: () => void;
}

export function DeviceSelector({ devices, onSelect, onRefresh, onDismiss }: DeviceSelectorProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[rgba(10,10,26,0.95)] z-20 p-6">
      <div className="max-w-[400px] w-full space-y-4 text-center">
        <p className="text-4xl">🎵</p>
        <p className="text-lg font-bold neon-cyan">Open Spotify on Your Device</p>
        <p className="text-sm text-white/50">
          Make sure Spotify is open and playing on your phone, tablet, or computer, then tap Retry.
        </p>

        {devices.length > 0 && (
          <div className="space-y-2 mt-4">
            <p className="text-xs uppercase tracking-widest opacity-40">Available Devices</p>
            {devices.map((d) => (
              <button
                key={d.id}
                onClick={() => onSelect(d.id)}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-left hover:bg-white/[0.1] hover:border-[#00e5ff]/40 transition-all"
              >
                <span className="text-sm text-white">{d.name}</span>
                <span className="text-xs text-white/40 ml-2">({d.type})</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-3 justify-center mt-4">
          <Button variant="cyan" size="sm" onClick={onRefresh}>
            Retry
          </Button>
          <Button variant="outline" size="sm" onClick={onDismiss}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
