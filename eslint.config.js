import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Global ignores - combines .eslintignore and ignorePatterns from .eslintrc.cjs
  {
    ignores: [
      'node_modules/**',
      'build/**',
      'db/**',
      '.cache/**',
      'functions/**',
      '.react-router/**', // Auto-generated React Router types
    ],
  },

  // Base recommended configs
  js.configs.recommended,

  // Main configuration
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        // TypeScript Node.js namespace
        NodeJS: 'readonly',
        // Cloudflare Workers types (from @cloudflare/workers-types)
        D1Database: 'readonly',
        D1PreparedStatement: 'readonly',
        D1Response: 'readonly',
        R2Bucket: 'readonly',
        // React (for files that don't import it but use JSX)
        React: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      react: react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      // TypeScript recommended rules
      ...tseslint.configs.recommended.rules,

      // React recommended rules
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,

      // React Hooks rules
      ...reactHooks.configs.recommended.rules,

      // Disable conflicting rules for Prettier
      ...prettierConfig.rules,

      // Custom rule overrides from original config
      'jsx-a11y/anchor-has-content': 'off',
      'react/no-children-prop': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'prefer-const': [
        'error',
        {
          destructuring: 'all',
        },
      ],
      'react/no-unescaped-entities': 'off',
      // Allow unused vars that start with underscore
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
