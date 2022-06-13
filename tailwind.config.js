/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        theme1: {
          primary: '#9aebe7',
          dark: '#49ded7',
          darker: '#08ccc2',
        },
        theme2: {
          primary: '#adfee0',
          dark: '#5df1ba',
          darker: '#1cda94',
        },
        linkLight: '#3a7fab',
        linkDark: '#3fb9f3',
        darkBackground: '#262c30',
        gray: {
          950: '#fafafa',
          900: '#ececec',
          850: '#c1c8cc',
          800: '#cbcbcb',
          750: '#a6a6a6',
          700: '#9a9a9a',
          600: '#717579',
          500: '#5d6164',
          400: '#4d4f52',
          300: '#383f45',
          200: '#272d2f',
          100: '#1e2224',
        },
      },
    },
    fontFamily: {
      sans: ['Mulish', 'sans-serif'],
    },
  },
  plugins: [],
};
