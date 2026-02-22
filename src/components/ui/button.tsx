import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-extrabold uppercase tracking-widest transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 hover:scale-105",
  {
    variants: {
      variant: {
        pink: "bg-gradient-to-br from-[#ff2d95] to-[#ff6ec7] text-white shadow-[0_0_20px_rgba(255,45,149,0.4),0_4px_15px_rgba(0,0,0,0.3)]",
        cyan: "bg-gradient-to-br from-[#00e5ff] to-[#00b8d4] text-[#0a0a1a] shadow-[0_0_20px_rgba(0,229,255,0.4),0_4px_15px_rgba(0,0,0,0.3)]",
        gold: "bg-gradient-to-br from-[#ffd700] to-[#ffaa00] text-[#0a0a1a] shadow-[0_0_20px_rgba(255,215,0,0.4),0_4px_15px_rgba(0,0,0,0.3)]",
        red: "bg-gradient-to-br from-[#ff3b3b] to-[#ff6b6b] text-white shadow-[0_0_20px_rgba(255,59,59,0.4),0_4px_15px_rgba(0,0,0,0.3)]",
        outline:
          "border-2 border-white/20 bg-transparent text-white/70 hover:border-white/45 hover:text-white",
        ghost: "bg-transparent hover:bg-white/5 text-white/70 hover:text-white",
      },
      size: {
        default: "px-12 py-4 text-lg",
        sm: "px-5 py-2 text-sm",
        icon: "h-8 w-8 rounded-full p-0",
      },
    },
    defaultVariants: {
      variant: "pink",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
