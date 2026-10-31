import { LinearProgress } from "@mui/material";
import { useT } from "../i18n";

/** Indeterminate page-level loading bar, announced to assistive tech. */
export function Progress() {
  const t = useT();
  return (
    <LinearProgress aria-label={t("state.loading")} data-test-id="progress" />
  );
}
