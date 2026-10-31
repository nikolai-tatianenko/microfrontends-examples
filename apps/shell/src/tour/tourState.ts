const KEY = "mf-tour-seen";

/**
 * Whether the visitor has already been offered the tour. Storage can throw (private windows, blocked site data);
 * then we answer "seen", because a tour that cannot remember it ran would greet the visitor on every page load.
 */
export function hasSeenTour(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return true;
  }
}

export function markTourSeen(): void {
  try {
    localStorage.setItem(KEY, "1");
  } catch {
    // Nothing to do: see hasSeenTour.
  }
}
