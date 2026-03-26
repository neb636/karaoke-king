import { useRef, useState } from "react";
import { X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Player } from "@/types";

interface PlayerRowProps {
  player: Player;
  index: number;
  showRemove: boolean;
  onNameChange: (name: string) => void;
  onEmojiChange: (emoji: string) => void;
  onBumpersChange: (bumpers: boolean) => void;
  onRemove: () => void;
}

function extractFirstEmoji(text: string): string | null {
  const segmenter = new Intl.Segmenter();
  for (const { segment } of segmenter.segment(text)) {
    const cp = segment.codePointAt(0);
    if (cp !== undefined && cp > 127) return segment;
  }
  return null;
}

export function PlayerRow({
  player,
  index,
  showRemove,
  onNameChange,
  onEmojiChange,
  onBumpersChange,
  onRemove,
}: PlayerRowProps) {
  const [editingEmoji, setEditingEmoji] = useState(false);
  const emojiInputRef = useRef<HTMLInputElement>(null);

  function handleEmojiButtonClick() {
    setEditingEmoji(true);
    setTimeout(() => emojiInputRef.current?.focus(), 0);
  }

  function handleEmojiInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const emoji = extractFirstEmoji(e.target.value);
    if (emoji) {
      onEmojiChange(emoji);
      setEditingEmoji(false);
    }
  }

  function handleEmojiInputBlur() {
    setEditingEmoji(false);
  }

  function handleEmojiInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setEditingEmoji(false);
    }
  }

  return (
    <div className="flex items-center gap-2.5 w-full animate-slide-in">
      {/* Player number */}
      <span className="font-display text-lg w-7 text-center flex-shrink-0 opacity-40">
        {index + 1}
      </span>

      {/* Emoji picker */}
      <div className="relative flex-shrink-0">
        {editingEmoji ? (
          <input
            ref={emojiInputRef}
            type="text"
            inputMode="text"
            placeholder="😀"
            onChange={handleEmojiInputChange}
            onBlur={handleEmojiInputBlur}
            onKeyDown={handleEmojiInputKeyDown}
            className={cn(
              "w-11 h-11 text-center text-xl rounded-2xl outline-none",
              "bg-white/10 border-2 border-[#ff2d95] shadow-[0_0_12px_rgba(255,45,149,0.27)]",
              "placeholder:text-white/30",
            )}
          />
        ) : (
          <button
            type="button"
            onClick={handleEmojiButtonClick}
            title="Pick your emoji"
            className={cn(
              "w-11 h-11 text-center text-xl rounded-2xl flex-shrink-0 flex items-center justify-center",
              "transition-all duration-200",
              player.emoji
                ? "bg-white/10 border-2 border-white/20 hover:border-[#ff2d95]/60"
                : "bg-white/5 border-2 border-dashed border-white/20 hover:border-[#ff2d95]/60 text-white/30",
            )}
          >
            {player.emoji || <span className="text-sm">+</span>}
          </button>
        )}
      </div>

      {/* Name input */}
      <input
        type="text"
        value={player.name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder={`Player ${index + 1}...`}
        maxLength={16}
        autoComplete="off"
        className={cn(
          "flex-1 min-w-0 text-center font-semibold text-lg",
          "bg-white/5 border-2 border-white/15 rounded-2xl",
          "px-4 py-2.5 text-white outline-none",
          "transition-all duration-200",
          "focus:border-[#ff2d95] focus:shadow-[0_0_12px_rgba(255,45,149,0.27)]",
          "placeholder:text-white/30",
        )}
      />

      {/* Assist toggle — hidden for now, logic remains intact */}
      <button
        type="button"
        title={player.bumpers ? "Assist on" : "Assist off (score boost)"}
        aria-label={`Toggle assist for player ${index + 1}`}
        aria-pressed={player.bumpers}
        onClick={() => onBumpersChange(!player.bumpers)}
        style={{ display: "none" }}
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0",
          "border transition-all duration-200",
          player.bumpers
            ? "bg-[#00e5ff]/15 border-[#00e5ff]/50 text-[#00e5ff] shadow-[0_0_8px_rgba(0,229,255,0.25)]"
            : "bg-white/5 border-white/10 text-white/35 hover:bg-white/10 hover:border-white/20 hover:text-white/60",
        )}
      >
        <Zap size={16} fill={player.bumpers ? "currentColor" : "none"} />
      </button>

      {/* Remove button */}
      <button
        onClick={onRemove}
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          "border border-white/15 bg-red-500/15 text-red-400",
          "transition-all duration-150 hover:bg-red-500/35 hover:scale-110",
          showRemove ? "visible" : "invisible",
        )}
        aria-label="Remove player"
      >
        <X size={14} />
      </button>
    </div>
  );
}
