import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      animation: {
        'gradient-x': 'gradient-x 5s ease infinite',
        'text-focus-in': 'text-focus-in 1s cubic-bezier(0.550, 0.085, 0.680, 0.530) both',
        'slide-in-elliptic-top-fwd': 'slide-in-elliptic-top-fwd 0.7s cubic-bezier(0.250, 0.460, 0.450, 0.940) both',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
        'text-focus-in': {
            '0%': {
                filter: 'blur(12px)',
                opacity: '0',
            },
            '100%': {
                filter: 'blur(0px)',
                opacity: '1',
            },
        },
        'slide-in-elliptic-top-fwd': {
            '0%': {
                transform: 'translateY(-600px) rotateX(-30deg) scale(0)',
                'transform-origin': '50% 100%',
                opacity: '0',
            },
            '100%': {
                transform: 'translateY(0) rotateX(0) scale(1)',
                'transform-origin': '50% 1400px',
                opacity: '1',
            },
        }
      },
    },
  },
  plugins: [],
};
export default config;