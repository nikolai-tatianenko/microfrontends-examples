import { tokens, type TokenPath } from "./generated/tokens";

const channel = (value: number) => {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

function luminance(hex: string) {
  const [r = 0, g = 0, b = 0] = [1, 3, 5].map((i) =>
    channel(Number.parseInt(hex.slice(i, i + 2), 16)),
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio between two `#rrggbb` colors, from 1 to 21. */
export function contrastRatio(foreground: string, background: string) {
  const [light, dark] = [luminance(foreground), luminance(background)].sort(
    (a, b) => b - a,
  ) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}

export interface ContrastPair {
  foreground: TokenPath;
  background: TokenPath;
  /** 7 for text (WCAG 1.4.6); 3 for a focus ring or other graphic (1.4.11). */
  minimum: number;
  /** Modes the pair must hold in; owner labels are the same in both. */
  modes: readonly ("light" | "dark")[];
}

const BOTH = ["light", "dark"] as const;
const SURFACES = [
  "color.surface.default",
  "color.surface.raised",
  "color.surface.muted",
] as const;

/** Every foreground and background the system pairs up. The unit test and the Storybook matrix both read this. */
export const CONTRAST_PAIRS: readonly ContrastPair[] = [
  ...SURFACES.flatMap((background) =>
    (
      [
        "color.text.default",
        "color.text.muted",
        "color.primary.default",
      ] as const
    ).map((foreground) => ({
      foreground,
      background,
      minimum: 7,
      modes: BOTH,
    })),
  ),
  ...(["color.negative", "color.positive"] as const).flatMap((foreground) =>
    (["color.surface.default", "color.surface.raised"] as const).map(
      (background) => ({ foreground, background, minimum: 7, modes: BOTH }),
    ),
  ),
  {
    foreground: "color.text.onPrimary",
    background: "color.primary.default",
    minimum: 7,
    modes: BOTH,
  },
  ...SURFACES.map((background) => ({
    foreground: "color.focus" as const,
    background,
    minimum: 3,
    modes: BOTH,
  })),
  ...(
    [
      "color.owner.shell",
      "color.owner.marketing",
      "color.owner.auth",
      "color.owner.dashboard",
      "color.owner.landing",
    ] as const
  ).map((background) => ({
    foreground: "color.owner.text" as const,
    background,
    minimum: 7,
    modes: BOTH,
  })),
];

/** The resolved value of a token in one mode. */
export function tokenValue(mode: "light" | "dark", path: TokenPath): string {
  let node: unknown = tokens[mode];
  for (const key of path.split("."))
    node = (node as Record<string, unknown>)[key];
  return node as string;
}
