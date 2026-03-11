import { Button } from "@/components/ui/button";

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorBanner({ message, onRetry, onDismiss }: ErrorBannerProps) {
  return (
    <div className="w-full max-w-[500px] px-4 py-3 rounded-xl border border-[#ff2d95]/30 bg-[#ff2d95]/[0.08] flex items-center gap-3">
      <p className="flex-1 text-sm text-white/70">{message}</p>
      {onRetry && (
        <Button variant="pink" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-white/30 hover:text-white/60 text-sm transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  );
}
