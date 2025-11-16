module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
  env: {
    es2022: true,
    node: true,
  },
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
  ignorePatterns: ["cypress.config.ts", "dist", "node_modules"],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-unused-expressions": "off",
    "@typescript-eslint/no-unsafe-return": "off",
    "no-useless-escape": "off",
    "prefer-const": "off",
  },
  overrides: [
    {
      files: ["cypress/**/*.ts"],
      env: {
        "cypress/globals": true,
      },
      plugins: ["cypress"],
      extends: ["plugin:cypress/recommended"],
    },
  ],
};
