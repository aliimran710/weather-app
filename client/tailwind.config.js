import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1200px" },
    },
    extend: {
      colors: {
        // Design tokens — the sky-blue + white system from the plan.
        sky: {
          deep: "#0A3D6B",
          DEFAULT: "#3B9EEF",
          pale: "#CDE8FF",
        },
        cloud: "#FFFFFF",
        sun: "#FFC857",
        ink: "#0C2A43",
        // Adaptive tokens (flip via html.theme-night) for text + accents.
        fg: "rgb(var(--fg) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        // shadcn semantic tokens, wired to CSS vars in index.css
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
      },
      fontFamily: {
        display: ["Sora", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        lg: "1.25rem",
        md: "1rem",
        sm: "0.75rem",
      },
      boxShadow: {
        glass: "0 10px 40px -12px rgba(10, 61, 107, 0.45)",
        "glass-sm": "0 6px 20px -8px rgba(10, 61, 107, 0.35)",
        lift: "0 24px 60px -20px rgba(10, 61, 107, 0.55)",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        "drift-slow": {
          "0%": { transform: "translateX(-8%)" },
          "100%": { transform: "translateX(108%)" },
        },
        "drift-med": {
          "0%": { transform: "translateX(-14%)" },
          "100%": { transform: "translateX(114%)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.2" },
          "50%": { opacity: "1" },
        },
        "sun-pulse": {
          "0%, 100%": { opacity: "0.85", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.04)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        rain: {
          "0%": { transform: "translateY(-20%)", opacity: "0" },
          "30%": { opacity: "0.5" },
          "100%": { transform: "translateY(120vh)", opacity: "0" },
        },
      },
      animation: {
        "drift-slow": "drift-slow 90s linear infinite",
        "drift-med": "drift-med 55s linear infinite",
        twinkle: "twinkle 4s ease-in-out infinite",
        "sun-pulse": "sun-pulse 8s ease-in-out infinite",
        "fade-up": "fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        rain: "rain 1.1s linear infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
