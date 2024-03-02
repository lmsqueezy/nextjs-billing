const { resolve } = require("node:path");

const project = resolve(__dirname, "tsconfig.json");

module.exports = {
  root: true,
  extends: [
    require.resolve("@vercel/style-guide/eslint/node"),
    require.resolve("@vercel/style-guide/eslint/next"),
    require.resolve("@vercel/style-guide/eslint/typescript"),
    "plugin:tailwindcss/recommended",
  ],
  parserOptions: {
    project,
  },
  settings: {
    "import/resolver": {
      typescript: {
        project,
      },
    },
    tailwindcss: {
      callees: ["cn", "clsx"],
    },
  },
  rules: {
    "no-console": 1,
    "no-unused-vars": 0,
    "import/no-default-export": 0,

    "tailwindcss/no-custom-classname": 0,
    "tailwindcss/classnames-order": 0,

    "@typescript-eslint/array-type": 0,
    "@typescript-eslint/no-misused-promises": 0,
    "@typescript-eslint/consistent-type-definitions": 0,
    "@typescript-eslint/explicit-function-return-type": 0,
    "@typescript-eslint/no-unused-vars": [1, { argsIgnorePattern: "^_" }],

    "@typescript-eslint/consistent-type-imports": [
      1,
      {
        prefer: "type-imports",
        fixStyle: "inline-type-imports",
      },
    ],
  },
};
