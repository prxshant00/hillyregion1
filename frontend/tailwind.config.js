/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tactical: {
          bg: "#080c14",
          surface: "#0f172a",
          card: "#131d33",
          border: "#1e293b",
          highlight: "#334155",
          accent: "#06b6d4"
        },
        risk: {
          normal: "#10b981",
          advisory: "#eab308",
          watch: "#f97316",
          warning: "#ef4444"
        }
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Courier New", "monospace"],
        sans: ["Outfit", "Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"]
      }
    },
  },
  plugins: [],
}
