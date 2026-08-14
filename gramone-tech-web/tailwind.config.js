/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0B1220",
        surface: "#111827",
        "surface-alt": "#1F2937",
        primary: "#0F766E",
        "primary-hover": "#115E59",
        "text-primary": "#F8FAFC",
        "text-secondary": "#CBD5E1",
        border: "#334155",
        critical: "#DC2626",
        warning: "#D97706",
        success: "#15803D",
      },
      borderRadius: {
        card: "20px",
        btn: "14px",
      },
    },
  },
  plugins: [],
}
