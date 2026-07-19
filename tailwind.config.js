/** @type {import('tailwindcss').Config} */
import { palette } from "./src/theme/palette.js";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Mashkanta simulator design system — see src/theme/palette.js
        cream: palette.cream,
        card: palette.card,
        accentSoft: palette.accentSoft,
        accentMid: palette.accentMid,
        accent: palette.accent,
        accentDeep: palette.accentDeep,
        ink: palette.ink,
        inkMuted: palette.inkMuted,
        hairline: palette.hairline,
        // Legacy tokens kept so the previous tabbed app still compiles/styles
        navy: "#1B3A6B",
        "navy-dark": "#0D2144",
        "navy-mid": "#2A5298",
        "sky-soft": "#DBEAFE",
        "sky-mid": "#BFDBFE",
        "sky-accent": "#93C5FD",
        "warm-gray": "#E8E0D5",
        "warm-border": "#D4C9BC",
        good: "#2F855A",
        warn: "#B7791F",
        bad: "#C53030",
      },
      fontFamily: {
        serif: ['"DM Serif Display"', "Georgia", "serif"],
        sans: ["Figtree", "Outfit", "system-ui", "sans-serif"],
      },
      boxShadow: {
        lift: "0 1px 2px rgba(42, 42, 40, 0.04), 0 6px 18px rgba(42, 42, 40, 0.05)",
        liftHover: "0 2px 4px rgba(42, 42, 40, 0.05), 0 10px 28px rgba(42, 42, 40, 0.08)",
      },
      borderRadius: {
        pill: "999px",
      },
    },
  },
  plugins: [],
};
