import type { Config } from "tailwindcss";

export default {
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
        ink: "#14221f",
        sand: {
          50: "#f7f3ea",
          100: "#efe8d8",
          200: "#e4d9c2",
        },
        teal: {
          700: "#0f6a5c",
          800: "#0b4f45",
          900: "#0a3b34",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 20px 60px rgba(11, 79, 69, 0.12)",
      },
    },
  },
  plugins: [],
} satisfies Config;
