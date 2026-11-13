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
        episphere: {
          navy: "#0B132B",
          slate: "#0F172A",
          teal: "#0D9488",
          cyan: "#0EA5E9",
          bg: "#F8FAFC",
          surface: "#FFFFFF",
          border: "#E2E8F0",
          "text-primary": "#0F172A",
          "text-secondary": "#64748B",
          critical: "#E11D48",
          warning: "#D97706",
          normal: "#059669",
        },
      },
    },
  },
  plugins: [],
};

export default config;
