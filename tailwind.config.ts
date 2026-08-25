import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "rgb(var(--base) / <alpha-value>)",
        panel: "rgb(var(--panel) / <alpha-value>)",
        "panel-2": "rgb(var(--panel-2) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        "line-2": "rgb(var(--line-2) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        faint: "rgb(var(--faint) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        "accent-hi": "rgb(var(--accent-hi) / <alpha-value>)",
        coral: "rgb(var(--coral) / <alpha-value>)",
        sky: "rgb(var(--sky) / <alpha-value>)",
        sun: "rgb(var(--sun) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgb(var(--accent) / 0.25), 0 8px 40px -8px rgb(var(--accent) / 0.35)",
        card: "inset 0 1px 0 rgb(255 255 255 / 0.04), 0 0 0 1px rgb(var(--line) / 0.6), 0 24px 48px -24px rgb(0 0 0 / 0.6)",
        "card-hover": "inset 0 1px 0 rgb(255 255 255 / 0.06), 0 0 0 1px rgb(var(--accent) / 0.4), 0 32px 64px -24px rgb(0 0 0 / 0.7)",
      },
      animation: {
        "fade-up": "fade-up var(--dur, 600ms) var(--ease-out) both",
        "fade-in": "fade-in 400ms ease both",
        "scale-in": "scale-in 350ms var(--ease-out) both",
        shake: "shake-x 320ms var(--ease-in-out) both",
        "caret-blink": "caret-blink 1s steps(2, start) infinite",
        float: "float-y 6s ease-in-out infinite",
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "gradient-pan": "gradient-pan 8s ease infinite",
        "spin-slow": "spin-slow 14s linear infinite",
      },
      transitionTimingFunction: {
        "ease-out-strong": "cubic-bezier(0.23, 1, 0.32, 1)",
        "ease-in-out-strong": "cubic-bezier(0.77, 0, 0.175, 1)",
      },
      transitionDuration: {
        160: "160ms",
        240: "240ms",
      },
    },
  },
  plugins: [],
};
export default config;