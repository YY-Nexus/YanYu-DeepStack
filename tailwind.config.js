/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./styles/**/*.{css,scss}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2F54EB",
        secondary: "#A57FFE",
        "cloud-blue-500": "#5B8FF9",
        "mint-green": "#4ecdc4",
        "coral-pink": "#ff6b6b",
        "sky-blue": "#45b7d1",
        "lemon-yellow": "#ffe66d",
        "light-blue": "#a2d2ff",
        "dark-gray": "#333333",
      },
    },
  },
  plugins: [],
};