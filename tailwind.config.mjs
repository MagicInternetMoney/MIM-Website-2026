/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        mim: {
          ink: "#fbf5dc",
          paper: "#fff8df",
          night: "#090806",
          coal: "#15130e",
          gold: "#f6c64f",
          mint: "#71daa1",
          red: "#ff7d7d",
          blue: "#6ec6ff",
          rust: "#c05c37",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 20px 80px rgba(246, 198, 79, 0.16)",
      },
    },
  },
  plugins: [],
};
