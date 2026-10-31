/** All visible text in one place, ready to be keyed for translation like `@blog/ui`'s `useT`. */
export const copy = {
  badge: "Module Federation 2 · Rspack + Vite · React 19",
  title: "One product, built by independent teams",
  lead: "A blog assembled at runtime from separately built and deployed apps: a React shell, React and Vue remotes, one GraphQL API.",
  cta: {
    start: "Get started",
    blog: "Read the blog",
    pricing: "See pricing",
  },
  pillarsTitle: "Why microfrontends",
  pillars: [
    {
      icon: "deploy",
      title: "Independent deploys",
      text: "Each app has its own build, image and release. Shipping marketing never waits for the dashboard.",
    },
    {
      icon: "contract",
      title: "A typed contract",
      text: "A remote exposes one function, mount(). The host injects the session and the Apollo client; remotes never import each other.",
    },
    {
      icon: "isolation",
      title: "Failure isolation",
      text: "If a remote is down, only its section shows a retryable error. The rest of the site keeps working.",
    },
  ],
  stackTitle: "Five apps, three styling stacks, two bundlers",
  stackLead:
    "Teams pick their own tools. The contract is the only thing they share.",
  stack: [
    { name: "shell", role: "Host", tech: "React 19 · MUI · Rspack" },
    { name: "marketing", role: "Remote", tech: "React 19 · MUI · Rspack" },
    { name: "auth", role: "Remote", tech: "React 19 · MUI · Rspack" },
    { name: "dashboard", role: "Remote", tech: "Vue 3 · scoped CSS · Rspack" },
    {
      name: "landing",
      role: "Remote",
      tech: "React 19 · shadcn/ui · Tailwind v4 · Vite",
      current: true,
    },
  ],
  currentLabel: "You are here",
  finalTitle: "Try it with the demo account",
  finalText:
    "Sign in as demo@example.com to see the Vue dashboard load next to this page's React code.",
  finalCta: "Sign in",
} as const;
