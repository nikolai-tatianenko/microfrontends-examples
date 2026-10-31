const cover = (hue: number) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="640" height="360" fill="hsl(${hue},60%,55%)"/></svg>`,
  )}`;

export const posts = [
  {
    id: "1",
    title: "Shipping a shell",
    body: "How the host composes remotes at runtime.",
    imageUrl: cover(210),
  },
  {
    id: "2",
    title: "Contracts over imports",
    body: "Why remotes never import each other.",
    imageUrl: cover(150),
  },
  {
    id: "3",
    title: "Visual regression",
    body: "Pixels as a test oracle.",
    imageUrl: cover(20),
  },
];

export const plans = [
  {
    id: "free",
    name: "Free",
    priceUsd: 0,
    features: ["1 project", "Community support"],
    ctaLabel: "Get started",
    ctaTo: "/auth/signup",
  },
  {
    id: "pro",
    name: "Pro",
    priceUsd: 15,
    features: ["20 projects", "Email support"],
    highlighted: true,
    ctaLabel: "Start trial",
    ctaTo: "/auth/signup",
  },
  {
    id: "team",
    name: "Team",
    priceUsd: 30,
    features: ["Unlimited projects", "Phone support"],
    ctaLabel: "Contact us",
    ctaTo: "/auth/signup",
  },
];
