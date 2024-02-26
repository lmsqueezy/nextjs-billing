import { wedgesTW } from "@lemonsqueezy/wedges";
import tailwindTypography from "@tailwindcss/typography";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "node_modules/@lemonsqueezy/wedges/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
      container: {
        center: true,
        screens: {
          xl: "1140px",
          "2xl": "1140px",
        },
        padding: {
          DEFAULT: "2rem",
          sm: "2.5rem",
          lg: "3rem",
        },
      },
    },
  },
  darkMode: "class",
  plugins: [wedgesTW(), tailwindTypography()],
};

export default config;
