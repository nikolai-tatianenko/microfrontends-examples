import { cssVar } from "@blog/tokens";

/**
 * Who owns which region of the page. Shown by the "Show micro-apps" overlay so a viewer can see
 * the host and each independently deployed remote. The colors are design tokens, checked for 7:1 against white text.
 */
export const OWNERS = {
  shell: { tech: "React 19 host", color: cssVar("color.owner.shell") },
  marketing: {
    tech: "React 19 remote",
    color: cssVar("color.owner.marketing"),
  },
  auth: { tech: "React 19 remote", color: cssVar("color.owner.auth") },
  dashboard: { tech: "Vue 3 remote", color: cssVar("color.owner.dashboard") },
  landing: {
    tech: "React 19 · shadcn/ui remote",
    color: cssVar("color.owner.landing"),
  },
} as const;

export type OwnerName = keyof typeof OWNERS;
