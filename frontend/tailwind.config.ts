import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        graphite: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#090d16",
        },
        gold: {
          50: "#fffbe6",
          100: "#fff3b3",
          200: "#ffe780",
          300: "#ffd84d",
          400: "#ffc61a",
          500: "#e6ab00",
          600: "#b38200",
          700: "#805a00",
          800: "#4d3500",
          900: "#1a1100",
        },
      },
    },
  },
  plugins: [],
};

export default config;
