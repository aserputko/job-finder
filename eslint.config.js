// @ts-check
import js from '@eslint/js';
import importX from 'eslint-plugin-import-x';
import pluginN from 'eslint-plugin-n';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // ── Ignored paths ─────────────────────────────────────────────────────────
  { ignores: ['dist/**', 'node_modules/**'] },

  // ── Base JS recommended ───────────────────────────────────────────────────
  js.configs.recommended,

  // ── TypeScript strict ─────────────────────────────────────────────────────
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // ── Plugin: Node.js ───────────────────────────────────────────────────────
  pluginN.configs['flat/recommended-module'],

  // ── Plugin: import-x ─────────────────────────────────────────────────────
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,

  // ── Project-wide settings ─────────────────────────────────────────────────
  {
    languageOptions: {
      globals: { ...globals.node },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      'import-x/resolver': {
        typescript: { alwaysTryTypes: true },
        node: true,
      },
    },
    rules: {
      // ── TypeScript ─────────────────────────────────────────────────────────
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',

      // ── Node ───────────────────────────────────────────────────────────────
      'n/no-missing-import': 'off', // handled by import-x + tsc
      'n/no-unsupported-features/node-builtins': ['error', { version: '>=20.0.0' }],

      // ── Imports ────────────────────────────────────────────────────────────
      'import-x/no-duplicates': 'error',
      'import-x/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          alphabetize: { order: 'asc' },
        },
      ],

      // ── Unicorn – relax opinionated rules for a scripts-only project ───────
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-process-exit': 'off',
      'unicorn/filename-case': ['error', { case: 'kebabCase' }],
      'unicorn/no-array-reduce': 'off',
    },
  },
);
