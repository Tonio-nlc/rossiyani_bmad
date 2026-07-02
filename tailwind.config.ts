import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        role: {
          subject: "#3B82F6",
          object: "#EF7C5A",
          location: "#22C55E",
          possession: "#A78BFA",
          recipient: "#F59E0B",
        },
        brand: {
          primary: "#1E3A5F",
          surface: "#FAFAF9",
          card: "#FFFFFF",
          border: "#E5E3DC",
          "text-primary": "#1C1C1A",
          "text-secondary": "#6B6B67",
          "text-muted": "#9C9A93",
        },
      },
    },
  },
  plugins: [],
};

export default config;
