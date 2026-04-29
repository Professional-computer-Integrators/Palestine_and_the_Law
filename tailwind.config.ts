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
        /* PRIMARY (admin-configurable via CSS vars) */
        forest: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          light:   "rgb(var(--color-primary-light) / <alpha-value>)",
          dark:    "rgb(var(--color-primary-dark) / <alpha-value>)",
        },
        /* STATIC BLUE-GREY SURFACE PALETTE */
        cream: {
          DEFAULT: "#ddeaf5",   /* light blue-grey section bg */
          dark:    "#b8cfdf",   /* border / divider */
        },
        parchment: "#eef4f9",   /* main page background */
        surface: {
          DEFAULT: "#f4f8fc",   /* card / input bg */
          dark:    "#e2ecf3",   /* slightly deeper card bg */
        },
        /* TEXT */
        ink: {
          DEFAULT: "#1a2d3f",   /* primary body text */
          muted:   "#4a6076",   /* secondary body text */
          faint:   "#7a96aa",   /* placeholder / caption */
        },
        gold: {
          DEFAULT: "#c8973f",
          light:   "#e0b060",
          dark:    "#9e7530",
        },
      },
      fontFamily: {
        serif: ["var(--font-heading)", "Georgia", "serif"],
        sans:  ["var(--font-body)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;
