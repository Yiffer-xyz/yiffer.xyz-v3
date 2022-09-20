/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        text: {
          light: '#111',
          dark: '#eee',
        },
        status: {
          info1: '#57b5f3',
          info2: '#57b5f3',
          error1: '#f35757',
          error2: '#e2557f',
          warn1: '#f3b557',
          warn2: '#d38a32',
        },
        bgDark: '#262c30',
        theme1: {
          primary: '#9aebe7',
          primaryTrans: '#9aebe740',
          primaryMoreTrans: '#9aebe71a',
          dark: '#49ded7',
          darker: '#08ccc2',
          verydark: '#007a74',
        },
        theme2: {
          primary: '#adfee0',
          dark: '#5df1ba',
          darker: '#1cda94',
        },
        blue: {
          // I'm very open to naming suggestions here.
          // "strong" because the saturation is high. To be used in DARK mode
          strong: {
            100: '#007ec7',
            200: '#0f9ff3',
            300: '#3fb9f3',
          },
          // "weak" because saturation is low, meaning less color. To be used in LIGHT mode.
          weak: {
            100: '#2a6386',
            200: '#3a7fab',
          },
        },
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
      width: {
        'w-fit': 'fit-content',
      },
      borderWidth: {
        5: '5px',
      },
    },
    fontFamily: {
      sans: ['Mulish', 'sans-serif'],
    },
    container: {
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '8rem',
        xl: '12rem',
        '2xl': '16rem',
      },
    },
  },
  plugins: [],
};
