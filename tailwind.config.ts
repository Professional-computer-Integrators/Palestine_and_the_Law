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
        forest: {
          DEFAULT: "#1a4731",
          light: "#245e42",
          dark: "#112e20",
        },
        cream: {
          DEFAULT: "#f5f0e8",
          dark: "#e8e0d0",
        },
        gold: {
          DEFAULT: "#c8973f",
          light: "#e0b060",
          dark: "#9e7530",
        },
        parchment: "#faf8f4",
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;
