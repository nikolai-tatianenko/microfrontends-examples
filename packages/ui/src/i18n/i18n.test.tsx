import { render, screen } from "@testing-library/react";
import { I18nProvider, useT } from ".";
import { en } from "./en";

function Probe({ k }: { k: keyof typeof en }) {
  const t = useT();
  return <span>{t(k, { year: 2026, name: "Blog" })}</span>;
}

describe("i18n", () => {
  it("interpolates {placeholders}", () => {
    render(<Probe k="footer.copyright" />);
    expect(
      screen.getByText("© 2026 Blog. All rights reserved."),
    ).toBeInTheDocument();
  });

  it("uses a swapped catalog", () => {
    render(
      <I18nProvider messages={{ ...en, "nav.login": "Anmelden" }}>
        <Probe k="nav.login" />
      </I18nProvider>,
    );
    expect(screen.getByText("Anmelden")).toBeInTheDocument();
  });
});
