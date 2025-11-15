import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "475px", // Extra small devices (small phones)
        sm: "640px", // Small devices (large phones) - Tailwind default
        md: "768px", // Medium devices (tablets) - Tailwind default
        lg: "1024px", // Large devices (laptops) - Tailwind default
        xl: "1280px", // Extra large devices (desktops) - Tailwind default
        "2xl": "1536px", // 2X large devices (large desktops) - Tailwind default
        "3xl": "1920px", // 3X large devices (ultra-wide screens)
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
