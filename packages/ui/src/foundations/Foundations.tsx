import {
  CONTRAST_PAIRS,
  CSS_VARS,
  contrastRatio,
  tokenValue,
  tokens,
  type TokenPath,
} from "@blog/tokens";
import type { CSSProperties, ReactNode } from "react";

/*
 * The design-system pages in Storybook. Plain elements with inline styles on purpose: a documentation page must
 * not depend on the theme it documents, and must show both modes side by side whatever the toolbar says.
 */

const table: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 14,
};
const cell: CSSProperties = {
  padding: "8px 12px",
  textAlign: "left",
  verticalAlign: "middle",
  borderBottom: "1px solid color-mix(in srgb, currentColor 18%, transparent)",
};
const code: CSSProperties = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: 12,
};

type Group = "color" | "space" | "radius" | "size" | "font" | "motion";

const pathsOf = (group: Group) =>
  (Object.keys(CSS_VARS) as TokenPath[]).filter((p) =>
    p.startsWith(`${group}.`),
  );

/** The swatch is drawn over a checkerboard so translucent tokens (glows, scrim) are visible. */
function Swatch({ value }: { value: string }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-block",
        width: 36,
        height: 36,
        borderRadius: 6,
        border: "1px solid color-mix(in srgb, currentColor 30%, transparent)",
        background: `linear-gradient(${value}, ${value}), repeating-conic-gradient(color-mix(in srgb, currentColor 15%, transparent) 0 25%, transparent 0 50%) 0 0 / 12px 12px`,
        verticalAlign: "middle",
      }}
    />
  );
}

function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <table style={table}>
      <thead>
        <tr>
          {head.map((h) => (
            <th key={h} scope="col" style={cell}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

/** Every color token: its CSS variable and its light and dark value. */
export function ColorTable() {
  return (
    <Table head={["Token", "CSS variable", "Light", "Dark"]}>
      {pathsOf("color").map((path) => (
        <tr key={path}>
          <th scope="row" style={{ ...cell, ...code }}>
            {path}
          </th>
          <td style={{ ...cell, ...code }}>{CSS_VARS[path]}</td>
          {(["light", "dark"] as const).map((mode) => (
            <td key={mode} style={cell}>
              <Swatch value={tokenValue(mode, path)} />{" "}
              <span style={code}>{tokenValue(mode, path)}</span>
            </td>
          ))}
        </tr>
      ))}
    </Table>
  );
}

/** Level reached by a ratio, for the text next to a pair: the matrix says AAA, AA or fail, never only a number. */
export function level(ratio: number) {
  return ratio >= 7
    ? "AAA"
    : ratio >= 4.5
      ? "AA"
      : ratio >= 3
        ? "AA large"
        : "Fail";
}

/** Every foreground and background the system pairs up, with the measured ratio per mode. */
export function ContrastMatrix() {
  return (
    <Table head={["Foreground", "Background", "Needs", "Light", "Dark"]}>
      {CONTRAST_PAIRS.map((pair) => (
        <tr key={`${pair.foreground}/${pair.background}`}>
          <th scope="row" style={{ ...cell, ...code }}>
            {pair.foreground}
          </th>
          <td style={{ ...cell, ...code }}>{pair.background}</td>
          <td style={cell}>{pair.minimum}:1</td>
          {(["light", "dark"] as const).map((mode) => {
            const ratio = contrastRatio(
              tokenValue(mode, pair.foreground),
              tokenValue(mode, pair.background),
            );
            return (
              <td key={mode} style={cell}>
                <span
                  style={{
                    padding: "2px 6px",
                    borderRadius: 4,
                    background: tokenValue(mode, pair.background),
                    color: tokenValue(mode, pair.foreground),
                    border:
                      "1px solid color-mix(in srgb, currentColor 30%, transparent)",
                    marginRight: 8,
                  }}
                >
                  Aa
                </span>
                {ratio.toFixed(1)}:1 · {level(ratio)}
              </td>
            );
          })}
        </tr>
      ))}
    </Table>
  );
}

/** Spacing, radius, size and motion tokens, drawn at their real size where that means something. */
export function ScaleTable({
  group,
}: {
  group: "space" | "radius" | "size" | "motion";
}) {
  return (
    <Table head={["Token", "CSS variable", "Value", "Preview"]}>
      {pathsOf(group).map((path) => {
        const value = tokenValue("light", path);
        return (
          <tr key={path}>
            <th scope="row" style={{ ...cell, ...code }}>
              {path}
            </th>
            <td style={{ ...cell, ...code }}>{CSS_VARS[path]}</td>
            <td style={{ ...cell, ...code }}>{value}</td>
            <td style={cell}>
              {group === "space" && (
                <span
                  aria-hidden="true"
                  style={{
                    display: "inline-block",
                    height: 12,
                    width: value,
                    background: "currentColor",
                  }}
                />
              )}
              {group === "radius" && (
                <span
                  aria-hidden="true"
                  style={{
                    display: "inline-block",
                    width: 40,
                    height: 40,
                    border: "2px solid currentColor",
                    borderRadius: value,
                  }}
                />
              )}
              {group === "size" && (
                <span
                  aria-hidden="true"
                  style={{
                    display: "inline-block",
                    width: value,
                    height: value,
                    border: "1px dashed currentColor",
                  }}
                />
              )}
              {group === "motion" && "see the animations in a story"}
            </td>
          </tr>
        );
      })}
    </Table>
  );
}

/** The type family and a specimen. */
export function TypeSpecimen() {
  return (
    <p
      style={{
        fontFamily: tokens.light.font.family.sans,
        fontSize: 24,
        margin: 0,
      }}
    >
      The quick brown fox jumps over the lazy dog. 0123456789
    </p>
  );
}
