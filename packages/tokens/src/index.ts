import { CSS_VARS, tokens, type TokenPath } from "./generated/tokens";

export { CSS_VARS, tokens, type TokenPath };
export {
  CONTRAST_PAIRS,
  contrastRatio,
  tokenValue,
  type ContrastPair,
} from "./contrast";

export type { Mode } from "./mode";

/** `var(--bd-…)` for a token, so styles follow the active mode without knowing it. */
export const cssVar = (path: TokenPath) => `var(${CSS_VARS[path]})`;

/** Pixels in a dimension token such as `"44px"`. */
export const px = (dimension: string) => Number.parseFloat(dimension);
