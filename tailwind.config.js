/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Bangers", "cursive"],
        body: ["Outfit", "sans-serif"],
      },
      colors: {
        "neon-pink": "#ff2d95",
        "neon-cyan": "#00e5ff",
        "neon-gold": "#ffd700",
        "neon-green": "#39ff14",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "pulse-mic": "pulse-mic 2s ease-in-out infinite",
        "feedback-pop": "feedback-pop 0.4s ease-out",
        "count-pop": "count-pop 0.6s ease-out",
        "glow-pulse": "glow-pulse 1.5s ease-in-out infinite alternate",
        "slide-in": "slide-in 0.25s ease-out",
        "confetti-fall": "confetti-fall linear forwards",
      },
      keyframes: {
        "pulse-mic": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.15)" },
        },
        "feedback-pop": {
          "0%": { transform: "scale(1.4)", opacity: "0.6" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "count-pop": {
          "0%": { transform: "scale(2)", opacity: "0" },
          "50%": { transform: "scale(0.9)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "glow-pulse": {
          from: {
            textShadow:
              "0 0 10px #ffd700, 0 0 40px rgba(255,215,0,0.4)",
          },
          to: {
            textShadow:
              "0 0 20px #ffd700, 0 0 60px rgba(255,215,0,0.53), 0 0 100px rgba(255,215,0,0.27)",
          },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateY(-10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "confetti-fall": {
          "0%": { opacity: "1", transform: "translateY(0) rotate(0deg)" },
          "100%": {
            opacity: "0",
            transform: "translateY(110vh) rotate(720deg)",
          },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
