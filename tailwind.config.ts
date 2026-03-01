import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#111111", // Obsidian
        accent: "#D4AF37", // Heritage Gold
        background: "#F9F8F6", // Architectural Cream
        surface: "#FFFFFF", // White for cards
        slate: "#6B6B6B", // Slate Gray
        "text-primary": "#1A1A1A",
      },
      fontFamily: {
        poppins: ["var(--font-poppins)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%) skew(-12deg)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        }
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        'pulse-ring': 'pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
      },
    },
  },
  plugins: [],
};
export default config;
