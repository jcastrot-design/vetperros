/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: "#f97316",
        "brand-dark": "#ea6c0a",
        accent: "#00c8b4",
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
