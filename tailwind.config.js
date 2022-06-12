/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        theme1: '#9aebe7',
        theme2: '#adfee0',
        linkLight: '#3a7fab',
        linkDark: '#3fb9f3',
        darkBackground: '#262c30',
      },
    },
    fontFamily: {
      sans: ['Mulish', 'sans-serif'],
    },
  },
  plugins: [],
};
