import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0E0E0E",
          2: "#5A5A5A",
          3: "#A8A8A8",
        },
        bg: "#F8F6F2",
        surface: "#FFFFFF",
        border: "#E8E4DC",
        accent: {
          DEFAULT: "#4F46E5",
          deep: "#3730A3",
          light: "#EEF0FF",
          border: "#C7D2FE",
        },
        green: "#10B981",
        amber: "#F59E0B",
        role: {
          subject: "#3B82F6",
          object: "#EF7C5A",
          location: "#22C55E",
          possession: "#A78BFA",
          recipient: "#F59E0B",
        },
      },
      borderRadius: {
        sm: "8px",
        md: "14px",
        lg: "18px",
      },
      maxWidth: {
        reading: "680px",
        vocab: "760px",
        content: "900px",
        dashboard: "1080px",
      },
    },
  },
  plugins: [],
};

export default config;
