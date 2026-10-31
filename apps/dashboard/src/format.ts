/** "+4.2%" / "−2.3%" (true minus sign) / "0.0%". */
export function formatDelta(pct: number): string {
  if (pct === 0) return "0.0%";
  return `${pct > 0 ? "+" : "−"}${Math.abs(pct).toFixed(1)}%`;
}

/** Locale-stable date for activity rows (UTC, so screenshots don't depend on the machine's timezone). */
export function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  });
}
