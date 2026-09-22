import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Ice & Butter palette — corrected from reference image:
        // deep navy #2F4860, clean white #FFFFFF, soft cobalt #7DA7D9,
        // butter yellow #FFF7CC, ice blue #DCEEFF
        navy: {
          950: "#1a2c3f",
          900: "#22384f",
          800: "#2a435e",
          700: "#2F4860", // Deep Navy — primary text / dark surfaces
          600: "#3d5c7a",
          500: "#4e7399",
          DEFAULT: "#2F4860",
        },
        cobalt: {
          200: "#c3d9f2",
          300: "#a8c8ee",
          400: "#8fb8e6",
          500: "#7DA7D9", // Soft Cobalt — primary brand
          600: "#5b8cc4",
          700: "#4172aa",
          DEFAULT: "#7DA7D9",
          glow: "rgba(125, 167, 217, 0.4)",
        },
        butter: {
          100: "#fffef5",
          200: "#fffce6",
          300: "#FFF7CC", // Butter Yellow — accent / highlight
          400: "#ffef99",
          500: "#ffe366",
          DEFAULT: "#FFF7CC",
          glow: "rgba(255, 247, 204, 0.6)",
        },
        ice: {
          50: "#FFFFFF", // Clean White
          100: "#f4f9ff",
          200: "#DCEEFF", // Ice Blue — secondary bg / borders
          300: "#b5dbff",
          400: "#85c1ff",
          DEFAULT: "#DCEEFF",
        },
        card: {
          DEFAULT: "#FFFFFF",
          hover: "#f4f9ff",
          border: "#DCEEFF",
        },
        brand: {
          300: "#a8c8ee",
          500: "#7DA7D9",
          600: "#5b8cc4",
          700: "#2F4860",
          glow: "#7DA7D9",
        },
        ai: {
          red: "#5b8cc4", // Soft cobalt deep for AI badge on light bg
          glow: "rgba(125, 167, 217, 0.3)",
        },
        human: {
          green: "#2F4860",
          glow: "rgba(47, 72, 96, 0.18)",
        },
        uncertain: {
          yellow: "#8a7400", // Darkened butter for readable text on #FFF7CC
          glow: "rgba(255, 247, 204, 0.6)",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(125, 167, 217, 0.4)",
        "glow-cobalt": "0 0 25px -5px rgba(125, 167, 217, 0.4)",
        "glow-butter": "0 0 25px -5px rgba(255, 247, 204, 0.4)",
        "glow-ice": "0 0 25px -5px rgba(220, 238, 255, 0.4)",
        glass: "0 8px 32px 0 rgba(16, 26, 36, 0.5)",
      },
      backdropBlur: {
        glass: "16px",
      }
    },
  },
  plugins: [],
};
export default config;

