import { Typography } from "@mui/material";
import { useT } from "../i18n";

/** Copyright line. `year` is injectable so snapshots stay stable. */
export function Copyright({
  year = new Date().getFullYear(),
}: {
  year?: number;
}) {
  const t = useT();
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      data-test-id="copyright"
    >
      {t("footer.copyright", { year, name: t("app.name") })}
    </Typography>
  );
}
