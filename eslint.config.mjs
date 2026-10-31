import js from "@eslint/js";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import vue from "eslint-plugin-vue";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/storybook-static/**",
      "**/gql/**",
      "reports/**",
      "playwright-report/**",
      "test-results/**",
      "**/*.cjs",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["**/*.tsx"],
    plugins: { "react-hooks": reactHooks, "jsx-a11y": jsxA11y },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
    },
  },
  ...vue.configs["flat/essential"].map((config) => ({
    ...config,
    files: ["**/*.vue"],
  })),
  {
    files: ["**/*.vue"],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
    rules: { "vue/multi-word-component-names": "off" },
  },
  {
    // Build configs are CommonJS by design (Rspack/Jest load them with require).
    files: ["**/*.config.js", "**/rspack.config.cjs"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  {
    files: [
      "**/*.{test,int.test}.{ts,tsx}",
      "e2e/**",
      "scripts/**",
      "**/test-utils.tsx",
    ],
    languageOptions: { globals: { ...globals.jest } },
    rules: { "@typescript-eslint/no-non-null-assertion": "off" },
  },
);
