module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint/eslint-plugin', 'eslint-plugin-expect-type'],
  extends: [
    'prettier/@typescript-eslint',
    'typestrict',
    'plugin:eslint-plugin-expect-type/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    project: './tsconfig.json',
    sourceType: 'module',
    ecmaFeatures: {
      impliedStrict: true,
    },
  },
  env: {
    es6: true,
    node: true,
  },
  overrides: [
    {
      files: ['src/__tests__/**'],
      env: {
        jest: true,
      },
    },
  ],
};
