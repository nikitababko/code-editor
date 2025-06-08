import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import unicorn from 'eslint-plugin-unicorn';
import stylisticTs from '@stylistic/eslint-plugin-ts';
import stylisticJs from '@stylistic/eslint-plugin-js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

const RULE_STATUSES = {
  OFF: 'off',
  ERROR: 'error',
  WARN: 'warn',
};

const commonTsRules = {
  // Common
  'no-console': [RULE_STATUSES.WARN, { allow: ['warn', 'error'] }],

  // TypeScript
  '@typescript-eslint/no-magic-numbers': RULE_STATUSES.OFF,
  '@typescript-eslint/consistent-type-imports': RULE_STATUSES.ERROR,
  '@typescript-eslint/no-namespace': RULE_STATUSES.OFF,
  '@typescript-eslint/ban-types': RULE_STATUSES.OFF,
  'import/prefer-default-export': RULE_STATUSES.OFF,
  'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0, maxBOF: 0 }],
  '@stylistic/ts/indent': ['error', 2],

  // Stylistic
  '@stylistic/js/arrow-parens': ['error', 'always'],
  '@stylistic/js/brace-style': ['error', '1tbs'],
  '@stylistic/js/block-spacing': ['error', 'never'],
  '@stylistic/js/max-len': ['error', { code: 90, ignoreStrings: true }],
  '@stylistic/js/object-curly-spacing': ['error', 'always'],
  '@stylistic/ts/quotes': ['error', 'single'],
  '@stylistic/ts/comma-dangle': ['error', 'always-multiline'],
  '@stylistic/js/semi': ['error', 'always'],
  '@stylistic/ts/semi': ['error', 'always'],

  // Unicorn
  'unicorn/filename-case': [
    RULE_STATUSES.ERROR,
    { cases: { camelCase: true, pascalCase: true, kebabCase: true } },
  ],
  'unicorn/prevent-abbreviations': [RULE_STATUSES.ERROR, { ignore: ['Props'] }],
  'unicorn/no-null': RULE_STATUSES.OFF,
  'unicorn/consistent-function-scoping': RULE_STATUSES.OFF,
};

const commonTsPlugins = {
  '@typescript-eslint': typescript,
  '@stylistic/ts': stylisticTs,
  '@stylistic/js': stylisticJs,
  unicorn,
};

export default [
  js.configs.recommended,
  prettier,

  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },

    ignores: ['node_modules', '.idea', 'dist', 'build'],
  },

  // TypeScript
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        sourceType: 'module',
        project: './tsconfig.json',
        tsconfigRootDir: process.cwd(),
      },
    },
    ignores: ['node_modules', '.idea', 'dist', 'build'],
    plugins: commonTsPlugins,
    rules: {
      ...commonTsRules,
    },
  },

  // React
  {
    files: ['**/*.tsx', '**/*.jsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        project: './tsconfig.json',
        tsconfigRootDir: process.cwd(),
      },
    },
    plugins: {
      ...commonTsPlugins,
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...commonTsRules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-useless-fragment': ['error', { allowExpressions: true }],
      'react/react-in-jsx-scope': 'off',
      'react/no-multi-comp': ['error'],
      'react/jsx-newline': 'error',
      'react/self-closing-comp': 'error',
      'react/no-array-index-key': 'error',
      'react/jsx-boolean-value': 'error',
      'react/display-name': 'off',
      'react/jsx-curly-brace-presence': 'error',
      'react/forbid-component-props': [
        'error',
        {
          forbid: ['style'],
        },
      ],
      'react/jsx-key': ['error'],
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },

  // JS
  {
    files: ['**/*.js'],
    rules: {
      '@typescript-eslint/no-var-requires': RULE_STATUSES.OFF,
      'unicorn/prefer-module': RULE_STATUSES.OFF,
    },
  },

  // JSON
  {
    files: ['**/*.json'],
    rules: {
      '@typescript-eslint/no-var-requires': RULE_STATUSES.OFF,
      'unicorn/prefer-module': RULE_STATUSES.OFF,
    },
  },
];
