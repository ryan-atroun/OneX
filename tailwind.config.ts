import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        onex: {
          black: "#050509",
          panel: "#11121a",
          panelSoft: "rgba(20, 22, 33, 0.72)",
          violet: "#8b5cf6",
          blue: "#3b82f6",
          cyan: "#22d3ee"
        }
      },
      boxShadow: {
        glow: "0 0 34px rgba(34, 211, 238, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
