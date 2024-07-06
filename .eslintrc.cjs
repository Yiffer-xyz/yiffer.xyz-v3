/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    '@remix-run/eslint-config',
    '@remix-run/eslint-config/node',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    'jsx-a11y/anchor-has-content': 'off',
    'react/no-children-prop': 0,
    '@typescript-eslint/no-non-null-assertion': 0,
    '@typescript-eslint/ban-ts-comment': 0,
    '@typescript-eslint/no-explicit-any': 'off',
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
    'prefer-const': [
      'error',
      {
        destructuring: 'all',
      },
    ],
    'react/no-unescaped-entities': 'off',
  },
  ignorePatterns: ['**/node_modules/**', '**/.cache/**', 'functions/**'],
  settings: {
    react: {
      version: 'detect',
    },
  },
};
