/**
 * Who owns which region of the page. Shown by the "Show micro-apps" overlay so a viewer can see
 * the host and each independently deployed remote. Colors are dark enough for white text (WCAG AA).
 */
export const OWNERS = {
  shell: { tech: "React 19 host", color: "#37474f" },
  marketing: { tech: "React 19 remote", color: "#1565c0" },
  auth: { tech: "React 19 remote", color: "#6a1b9a" },
  dashboard: { tech: "Vue 3 remote", color: "#1b5e20" },
  landing: { tech: "React 19 · shadcn/ui remote", color: "#92400e" },
} as const;

export type OwnerName = keyof typeof OWNERS;
