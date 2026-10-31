import { renderWithProviders } from "@blog/ui/testing";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  CredentialsFormView,
  type CredentialsFormViewProps,
} from "./CredentialsFormView";

const setup = (props: Partial<CredentialsFormViewProps> = {}) => {
  const onSubmit = jest.fn();
  renderWithProviders(
    <CredentialsFormView
      mode="signin"
      loading={false}
      onSubmit={onSubmit}
      {...props}
    />,
  );
  return { onSubmit };
};

const fill = async (email: string, password: string) => {
  await userEvent.type(screen.getByTestId("email"), email);
  await userEvent.type(screen.getByTestId("password"), password);
};

describe("CredentialsFormView", () => {
  it("does not submit invalid input and explains why, only after the first attempt", async () => {
    const { onSubmit } = setup();
    expect(
      screen.queryByText("Enter a valid email address."),
    ).not.toBeInTheDocument();

    await userEvent.click(screen.getByTestId("submit"));

    expect(
      screen.getByText("Enter a valid email address."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Password must be at least 8 characters."),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits valid credentials", async () => {
    const { onSubmit } = setup();
    await fill("a@b.co", "longenough");
    await userEvent.click(screen.getByTestId("submit"));
    expect(onSubmit).toHaveBeenCalledWith({
      email: "a@b.co",
      password: "longenough",
    });
  });

  it("fills the form from the demo account and submits it", async () => {
    const { onSubmit } = setup({
      demoAccount: { email: "demo@example.com", password: "password123" },
    });
    await userEvent.click(screen.getByTestId("demo-fill"));
    await userEvent.click(screen.getByTestId("submit"));
    expect(onSubmit).toHaveBeenCalledWith({
      email: "demo@example.com",
      password: "password123",
    });
  });

  it("offers no demo account unless asked", () => {
    setup();
    expect(screen.queryByTestId("demo-account")).not.toBeInTheDocument();
  });

  it("shows a server error and disables submit while loading", () => {
    setup({ error: "Invalid email or password.", loading: true });
    expect(screen.getByTestId("form-error")).toHaveTextContent(
      "Invalid email or password.",
    );
    expect(screen.getByTestId("submit")).toBeDisabled();
  });

  it.each([
    ["signin", "Sign In", "/auth/signup"],
    ["signup", "Sign Up", "/auth/signin"],
  ] as const)(
    "%s mode: submit label and the link to the other form",
    (mode, label, href) => {
      setup({ mode });
      expect(screen.getByTestId("submit")).toHaveTextContent(label);
      expect(screen.getByRole("link")).toHaveAttribute("href", href);
    },
  );
});
