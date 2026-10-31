import type { CodegenConfig } from "@graphql-codegen/cli";

/**
 * One schema (assembled from the API's domain modules), one generated folder per
 * consuming app. Each remote only sees types for the operations it declares.
 */
const consumers = ["marketing", "auth", "dashboard"];

const config: CodegenConfig = {
  schema: ["apps/api/src/schema.ts", "apps/api/src/modules/*/index.ts"],
  ignoreNoDocuments: true,
  generates: Object.fromEntries(
    consumers.map((app) => [
      `apps/${app}/src/gql/`,
      {
        preset: "client",
        documents: [`apps/${app}/src/**/*.{ts,tsx}`, `!apps/${app}/src/gql/**`],
        presetConfig: { fragmentMasking: false },
        config: { useTypeImports: true, enumsAsTypes: true },
      },
    ]),
  ),
};

export default config;
