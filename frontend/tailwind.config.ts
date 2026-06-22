import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        apple: {
          blue: "#0071E3",
          "blue-hover": "#0077ED",
          black: "#1D1D1F",
          gray: "#6E6E73",
          "gray-light": "#F5F5F7",
          border: "#D2D2D7",
          red: "#FF3B30",
          green: "#34C759",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "Helvetica Neue",
          "sans-serif",
        ],
      },
      borderRadius: {
        "apple-pill": "980px",
        "apple-card": "18px",
        "apple-input": "12px",
      },
      boxShadow: {
        "apple-card": "0 2px 8px rgba(0,0,0,0.08)",
        "apple-card-hover": "0 8px 24px rgba(0,0,0,0.12)",
        "apple-modal": "0 20px 60px rgba(0,0,0,0.15)",
        "apple-focus": "0 0 0 3px rgba(0,113,227,0.15)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-3px)" },
          "50%": { transform: "translateX(3px)" },
          "75%": { transform: "translateX(-2px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fadeIn 300ms ease both",
        shake: "shake 300ms ease",
        shimmer: "shimmer 1.5s linear infinite",
      },
      transitionTimingFunction: {
        apple: "cubic-bezier(0.2, 0, 0, 1)",
      },
    },
  },
  plugins: [],
} satisfies Config;

