import type { Config } from 'tailwindcss';

// RESPONSIVE  BREAKPOINTS:
// sm 640
// md 768
// lg 1024
// xl 1280
// 2xl 1536

export const colors = {
  text: {
    light: '#292929',
    weakLight: '#595959',
    dark: '#eee',
    weakDark: '#c0c0c0',
    white: '#fff',
  },
  status: {
    info1: '#36aaf8',
    info2: '#1f90db',
    error2: '#e2557f',
    warn1: '#ec9e3f',
    warn2: '#fbc164',
  },
  bgDark: '#262c30',
  theme1: {
    primary: '#9aebe7',
    primaryEvenLessTrans: '#9aebe7aa',
    primaryLessTrans: '#9aebe770',
    primaryTrans: '#9aebe740',
    primaryMoreTrans: '#9aebe71a',
    primaryTransDarker: '#7ce9e460',
    light: '#d8fefd',
    dark: '#49ded7',
    darker: '#08ccc2',
    darker2: '#02c1b7',
    darker3: '#00b8ad',
    verydark: '#007a74',
    verydarker: '#005450',
    darkFaded: '#007a7440',
    primaryMoreTransSolid: '#eff8f8', // Color of primaryMoreTrans on white bg
  },
  theme2: {
    primary: '#adfee0',
    primaryEvenLessTrans: '#adfee0aa',
    primaryLessTrans: '#adfee070',
    primaryTrans: '#adfee740',
    dark: '#5df1ba',
    darker: '#1cda94',
    darker2: '#00c37a',
    darker3: '#00b56d',
    darkFaded: '#1cda9440',
  },
  themeMiddle: {
    primary: '#9AEBE7',
    dark: '#08CCC2',
  },
  blue: {
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
    trans: '#3fb9f340',
    moreTrans: '#3fb9f31a',
  },
  red: {
    // "strong" because the saturation is high. To be used in DARK mode
    strong: {
      100: '#b12525',
      200: '#d42a2a',
      300: '#ff5757',
    },
    // "weak" because saturation is low, meaning less color. To be used in LIGHT mode.
    weak: {
      100: '#9d3f3f',
      200: '#c24747',
    },
    trans: '#ff575740',
    moreTrans: '#ff57571a',
  },
  gray: {
    950: '#fafafa',
    900: '#ececec',
    875: '#e0e0e0',
    850: '#c1c8cc',
    800: '#cbcbcb',
    750: '#a6a6a6',
    700: '#9a9a9a',
    600: '#717579',
    500: '#5d6164',
    450: '#4f5255',
    400: '#4d4f52',
    300: '#383f45',
    250: '#2f353b',
    200: '#272d2f',
    150: '#202528',
    100: '#1e2224',
    borderLight: '#aaaaaa44',
  },
};

export default {
  darkMode: 'class',
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors,
      width: {
        'w-fit': 'fit-content',
      },
      borderWidth: {
        5: '5px',
        3: '3px',
      },
      maxWidth: {
        '80p': '80%',
        '90p': '90%',
        '95p': '95%',
      },
      lineHeight: {
        '0': '0',
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
} satisfies Config;
