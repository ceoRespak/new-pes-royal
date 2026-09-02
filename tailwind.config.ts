import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#003366", // royal blue
          50: "#eef4fb",
          100: "#d9e6f5",
          200: "#b3cceb",
          300: "#7fa8db",
          400: "#4a80c4",
          500: "#1a5cad",
          600: "#0a4788",
          700: "#003366",
          800: "#00244a",
          900: "#001833",
        },
        accent: {
          DEFAULT: "#D4AF37", // gold
          50: "#fbf7e9",
          100: "#f6edcc",
          200: "#edd99a",
          300: "#e4c566",
          400: "#dcb84c",
          500: "#D4AF37", // gold
          600: "#b3922a",
          700: "#8f7422",
          800: "#6b561b",
          900: "#4a3c13",
        },
        light: "#F5F5F5",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-poppins)", "var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        card: "0 10px 30px -12px rgba(0, 51, 102, 0.25)",
        "card-hover": "0 24px 50px -18px rgba(0, 51, 102, 0.4)",
        gold: "0 10px 30px -10px rgba(212, 175, 55, 0.55)",
      },
      backgroundImage: {
        "primary-gradient":
          "linear-gradient(135deg, #003366 0%, #0a4788 55%, #1a5cad 100%)",
        "gold-gradient":
          "linear-gradient(135deg, #D4AF37 0%, #e4c566 50%, #b3922a 100%)",
        "light-gradient": "linear-gradient(180deg, #f5f5f5 0%, #ffffff 100%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
        marquee: "marquee 30s linear infinite",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
