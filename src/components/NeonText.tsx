import { cn } from "@/lib/utils";

interface NeonTextProps {
  children: React.ReactNode;
  color?: "pink" | "cyan" | "gold" | "green";
  as?: React.ElementType;
  className?: string;
}

export function NeonText({
  children,
  color = "pink",
  as: Tag = "span",
  className,
}: NeonTextProps) {
  return (
    <Tag
      className={cn(
        "font-display",
        {
          "neon-pink": color === "pink",
          "neon-cyan": color === "cyan",
          "neon-gold": color === "gold",
          "neon-green": color === "green",
        },
        className,
      )}
    >
      {children}
    </Tag>
  );
}
