import { memo } from "react";
import { NeonText } from "@/components/NeonText";

interface HeaderV2Props {
  playerName: string;
  turnLabel: string;
  isCurated: boolean;
  isListening: boolean;
  songTitle?: string;
  songArtist?: string;
}

export const HeaderV2 = memo(function HeaderV2({
  playerName,
  turnLabel,
  isCurated,
  isListening,
  songTitle,
  songArtist,
}: HeaderV2Props) {
  return (
    <div className="text-center shrink-0">
      <p className="text-[0.62rem] uppercase tracking-[3px] text-white/35 mb-1">{turnLabel}</p>
      <NeonText as="h2" color="pink" className="text-[clamp(1.8rem,5vw,3rem)] leading-none">
        {playerName}
      </NeonText>
      {isCurated && isListening && songTitle && (
        <p className="text-[0.72rem] text-white/35 mt-1">
          <span className="text-white/55 font-semibold">{songTitle}</span>
          {songArtist && <span> · {songArtist}</span>}
        </p>
      )}
    </div>
  );
});
