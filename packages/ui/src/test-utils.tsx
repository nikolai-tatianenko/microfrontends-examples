import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router-dom";
import { UiProvider } from "./theme";

/** Render inside the providers every component expects (theme, i18n, router). */
export function renderWithProviders(ui: ReactElement, route = "/") {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <UiProvider mode="light">{ui}</UiProvider>
    </MemoryRouter>,
  );
}
