import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    // other paths...
  ],
  theme: {
    extend: {
      screens: {
        'xs': '380px',
      }
    },
  },
plugins: [require('tailwind-scrollbar')],
};

export default config;
