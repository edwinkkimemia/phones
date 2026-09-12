import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Matched to the PhoneLaptops logo: royal blue → electric cyan on deep navy
        brand: {
          50: "#EEF4FF",
          100: "#D9E8FF",
          200: "#BCD6FF",
          300: "#8DB8FF",
          400: "#5B93FF",
          500: "#2B6BFF",
          600: "#0F56E8",
          700: "#0C44B8",
          800: "#0F3A8F",
          900: "#12275E",
        },
        accent: {
          DEFAULT: "#00D5FF",
          dark: "#0093C4",
        },
        ink: {
          950: "#070C28",
          900: "#0E1538",
          800: "#1B2450",
        },
        mpesa: {
          DEFAULT: "#43B02A",
          dark: "#2E7D1F",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-sora)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,.06), 0 8px 24px -12px rgba(16,24,40,.18)",
        pop: "0 12px 40px -12px rgba(37,71,235,.35)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
