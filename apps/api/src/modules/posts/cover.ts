/** Deterministic cover art: no network, stable in screenshots. */
export function cover(seed: string): string {
  const hue = (Number(seed) * 67) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="640" height="360" fill="hsl(${hue},60%,55%)"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
