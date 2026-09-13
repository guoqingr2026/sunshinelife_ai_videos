/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0f1b5c",
        muted: "#374f86",
        primary: {
          DEFAULT: "#1f5fff",
          dark: "#0046d8",
          light: "#4f8dff",
        },
        secondary: {
          DEFAULT: "#ffd565",
          dark: "#664400",
        },
        card: "#ffffff",
        surface: "#f4f8ff",
        border: "#c6d7ff",
        success: "#0f9d58",
        // backward-compat aliases used across pages
        dark: "#f4f8ff",
        darker: "#ffffff",
      },
      fontFamily: {
        sans: ["Arial", "Helvetica", "Microsoft YaHei", "PingFang SC", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 18px rgba(31, 95, 255, 0.12)",
        primary: "0 8px 16px rgba(31, 95, 255, 0.35)",
        secondary: "0 6px 14px rgba(180, 130, 0, 0.28)",
      },
    },
  },
  plugins: [],
};
