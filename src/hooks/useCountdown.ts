import { useCallback, useState } from "react";
import { sleep } from "@/lib/utils";

export function useCountdown() {
  const [isActive, setIsActive] = useState(false);
  const [value, setValue] = useState<string | number>("");

  const run = useCallback(
    async (onDone: () => void, playSound?: (freq: number, dur: number) => void) => {
      setIsActive(true);

      for (let i = 3; i >= 1; i--) {
        setValue(i);
        playSound?.(600 + i * 100, 150);
        await sleep(900);
      }

      setValue("🎤");
      playSound?.(1200, 200);
      await sleep(600);

      setIsActive(false);
      setValue("");
      onDone();
    },
    [],
  );

  return { isActive, value, run };
}
