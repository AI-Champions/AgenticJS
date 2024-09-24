import globals from "globals";
import pluginJs from "@eslint/js";
import pluginTs from "typescript-eslint";
import parserTs from "@typescript-eslint/parser"; // Added parser for TypeScript
import pluginReact from "eslint-plugin-react";
import pluginJest from "eslint-plugin-jest";

export default [
  pluginJs.configs.recommended,
  ...pluginTs.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginJest.configs["flat/recommended"],
  {
    ignores: ["node_modules", "dist"],
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "commonjs",
        ecmaFeatures: { jsx: true },
      },
      parser: parserTs,
    },
    rules: {
      "react/jsx-filename-extension": [
        "warn",
        { extensions: [".js", ".jsx", ".ts", ".tsx"] },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-require-imports": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },
];
