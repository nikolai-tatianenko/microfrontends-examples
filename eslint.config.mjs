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
      "packages/tokens/src/generated/**",
      "reports/**",
      "playwright-report/**",
      "test-results/**",
      "**/*.cjs",
      ".remember/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
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
  {
    // Apps are peers and packages sit below them: nothing may import an app's source or its package.
    // The shell reaches a remote only through the mount() contract, at runtime.
    files: ["apps/**/*.{ts,tsx,vue}", "packages/**/*.{ts,tsx}"],
    ignores: ["**/*.stories.tsx", "**/*.test.{ts,tsx}", "**/*.int.test.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "**/apps/**",
                "@blog/shell",
                "@blog/landing",
                "@blog/marketing",
                "@blog/auth",
                "@blog/dashboard",
                "@blog/api",
              ],
              message:
                "Apps and packages do not import an app. Depend on @blog/contract or @blog/ui instead.",
            },
          ],
        },
      ],
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
      "**/*.stories.tsx",
      "e2e/**",
      "scripts/**",
      "**/test-utils.tsx",
    ],
    languageOptions: { globals: { ...globals.jest } },
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-empty-function": "off",
    },
  },
);
