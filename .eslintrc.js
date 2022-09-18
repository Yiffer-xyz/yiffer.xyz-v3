module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    '@remix-run/eslint-config',
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
    '@typescript-eslint/ban-ts-comment': 1,
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
  },
  ignorePatterns: ['**/node_modules/**', '**/.cache/**', 'functions/**'],
  settings: {
    react: {
      version: 'detect',
    },
  },
};
