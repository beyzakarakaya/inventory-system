/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        panel: "#111827",
        panel2: "#1f2937",
      },
    },
  },
  plugins: [],
};
