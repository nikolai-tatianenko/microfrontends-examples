/**
 * Commit messages follow Conventional Commits, the format Commitizen (`pnpm commit`) writes.
 * The local plugin adds two repo rules: no Cyrillic, and no AI-tool trailers in a message.
 */
const TRACES =
  /co-authored-by:.*(claude|anthropic|openai|copilot)|generated with/i;

export default {
  extends: ["@commitlint/config-conventional"],
  plugins: [
    {
      rules: {
        "no-cyrillic": (parsed) => {
          const text = parsed.raw ?? "";
          return [!/[Ѐ-ӿ]/.test(text), "the message must be in English"];
        },
        "no-tool-trailers": (parsed) => {
          const text = parsed.raw ?? "";
          return [!TRACES.test(text), "remove the tool attribution trailer"];
        },
      },
    },
  ],
  rules: {
    "no-cyrillic": [2, "always"],
    "no-tool-trailers": [2, "always"],
    // Subjects are short on purpose; bodies may carry longer lines (URLs, error text).
    "header-max-length": [2, "always", 100],
    "body-max-line-length": [1, "always", 120],
  },
};
