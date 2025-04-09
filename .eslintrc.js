module.exports = {
  root: true,
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  env: {
    node: true,
    browser: true,
    es2021: true,
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
      ],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
    },
  ],
  ignorePatterns: ['node_modules/', 'dist/', 'build/', '.turbo/'],
};