/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        mim: {
          ink: "#fff1c6",
          paper: "#ead8c2",
          night: "#050408",
          coal: "#100b13",
          stone: "#241713",
          violet: "#9a36ff",
          lavender: "#e4a9ff",
          cyan: "#66f8ff",
          green: "#92f052",
          gold: "#f6a83a",
          coin: "#d58a25",
          ember: "#ff6b2d",
          magenta: "#8c0c5e",
          blue: "#194bf7",
          red: "#ff5a42",
          parchment: "#d7b179",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 22px 90px rgba(102, 248, 255, 0.12), 0 0 34px rgba(154, 54, 255, 0.18)",
        coin: "0 18px 60px rgba(246, 168, 58, 0.18)",
      },
    },
  },
  plugins: [],
};
