// @ts-check
const tseslint = require("@typescript-eslint/eslint-plugin");
const tsparser = require("@typescript-eslint/parser");

module.exports = [
  {
    files: ["src/**/*.ts", "test/**/*.ts"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: "./tsconfig.eslint.json",
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      // any を使う場合は warning 止まりにする（error にすると既存コードが大量に引っかかる）
      "@typescript-eslint/no-explicit-any": "warn", // nfc-pcsc は ESM 対応していないため require() を許容
      "@typescript-eslint/no-require-imports": "off",
      // _ プレフィック㖁の、晲用未使用変数は許容
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
];
