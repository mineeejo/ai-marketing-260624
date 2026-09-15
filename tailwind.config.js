/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Pretendard", "sans-serif"],
        serif: ["'Instrument Serif'", "serif"],
      },
    },
  },
  plugins: [],
};
