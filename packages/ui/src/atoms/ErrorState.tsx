import { Alert, AlertTitle, Button } from "@mui/material";
import { useT } from "../i18n";

interface ErrorStateProps {
  /** Overrides the default title. */
  title?: string;
  /** Human-readable detail. */
  message?: string;
  /** Shows a retry button when provided. */
  onRetry?: () => void;
}

/**
 * One error treatment for everything that can fail at runtime: a remote that
 * did not load, a GraphQL query that errored.
 */
export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  const t = useT();
  return (
    <Alert
      severity="error"
      role="alert"
      data-test-id="error-state"
      action={
        onRetry && (
          <Button
            color="inherit"
            size="small"
            onClick={onRetry}
            data-test-id="error-state-retry"
          >
            {t("state.error.retry")}
          </Button>
        )
      }
    >
      <AlertTitle>{title ?? t("state.error.title")}</AlertTitle>
      {message}
    </Alert>
  );
}
