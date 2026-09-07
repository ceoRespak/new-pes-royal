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
          DEFAULT: "#002B6B", // deep navy
          50: "#eef3fb",
          100: "#dbe6f7",
          200: "#b8cdee",
          300: "#8aade0",
          400: "#4d82cc",
          500: "#1e5cb3",
          600: "#0a4695",
          700: "#002B6B",
          800: "#00204f",
          900: "#001638",
        },
        accent: {
          DEFAULT: "#FF5A00", // RESPAK orange
          50: "#fff3eb",
          100: "#ffe3cc",
          200: "#ffc799",
          300: "#ffa35c",
          400: "#FF7A1A", // secondary orange
          500: "#FF5A00",
          600: "#E04D00", // hover
          700: "#c2410c",
          800: "#9a350a",
          900: "#7c2a08",
        },
        light: "#F5F7FA",
        // neutral slate carried by Tailwind's own scale elsewhere
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-poppins)", "var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        card: "0 10px 30px -12px rgba(0, 43, 107, 0.18)",
        "card-hover": "0 24px 50px -18px rgba(0, 43, 107, 0.32)",
        accent: "0 10px 30px -10px rgba(255, 90, 0, 0.45)",
      },
      backgroundImage: {
        "primary-gradient":
          "linear-gradient(135deg, #001638 0%, #002B6B 55%, #0047B3 100%)",
        "accent-gradient":
          "linear-gradient(135deg, #FF5A00 0%, #FF7A1A 55%, #E04D00 100%)",
        "light-gradient": "linear-gradient(180deg, #F5F7FA 0%, #ffffff 100%)",
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
