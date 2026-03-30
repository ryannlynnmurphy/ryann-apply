import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: { DEFAULT: "#FAF8F5", dark: "#F0EDE8" },
        charcoal: { DEFAULT: "#2D2A26", mid: "#3D3A36", light: "#5C5852" },
        gold: { DEFAULT: "#C9A96E", dim: "rgba(201,169,110,0.15)" },
        border: { DEFAULT: "#E0DBD4", dark: "#CCC7BF" },
        hzl: {
          green: "#5C8A5C",
          "green-bg": "#EDF5ED",
          blue: "#4A6E9A",
          "blue-bg": "#EBF1F8",
          amber: "#B06D20",
          "amber-bg": "#FFF3E0",
          red: "#8A4A4A",
          "red-bg": "#FBF0F0",
          purple: "#6A5A8A",
          "purple-bg": "#F2F0F8",
          teal: "#3A7A7A",
          "teal-bg": "#EDF5F5",
        },
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        sans: ["DM Sans", "sans-serif"],
        mono: ["DM Mono", "monospace"],
      },
      keyframes: {
        "indeterminate-bar": {
          "0%": { transform: "translateX(-100%)", width: "40%" },
          "50%": { transform: "translateX(60%)", width: "60%" },
          "100%": { transform: "translateX(200%)", width: "40%" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translate(-50%, -8px)" },
          "100%": { opacity: "1", transform: "translate(-50%, 0)" },
        },
      },
      animation: {
        "indeterminate-bar": "indeterminate-bar 1.8s ease-in-out infinite",
        "fade-in": "fade-in 0.3s ease-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
