import type { Config } from "tailwindcss";
import twAnimate from "tw-animate-css";

export default {
  content: [
    "./src/app/**/*.{ts,tsx,js,jsx}",
    "./src/components/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [twAnimate],
} satisfies Config;
