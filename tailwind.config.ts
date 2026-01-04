import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
      },
      screens: {
        xs: "360px", // Extra small devices (budget phones like Redmi 14C - 360-400px)
        sm: "640px", // Small devices (large phones) - Tailwind default
        md: "768px", // Medium devices (tablets) - Tailwind default
        lg: "1024px", // Large devices (laptops) - Tailwind default
        xl: "1280px", // Extra large devices (desktops) - Tailwind default
        "2xl": "1536px", // 2X large devices (large desktops) - Tailwind default
        "3xl": "1920px", // 3X large devices (ultra-wide screens)
        // Mobile-specific breakpoints
        mobile: { max: "639px" }, // Target mobile devices specifically
        "mobile-sm": { max: "359px" }, // Very small phones
      },
      perspective: {
        "1000": "1000px",
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
