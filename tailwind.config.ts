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
        bg: "#0a0a0c",
        panel: "#111114",
        panel2: "#16161b",
        line: "#22222a",
        ink: "#f5f5f7",
        ink2: "#a0a0aa",
        ink3: "#6b6b75",
        accent: "#ff5b1f",
        accent2: "#ff8a4a",
        ok: "#3ecf8e",
        warn: "#f5a524",
        bad: "#ef4444",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        soft: "0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};
export default config;
