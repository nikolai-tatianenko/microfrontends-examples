import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { UiProvider } from "@blog/ui";
import { fakeRemote, fakeServices } from "../test-utils";
import { RemoteRoute } from "./RemoteRoute";

const renderRoute = (
  load: () => Promise<{ mount: ReturnType<typeof fakeRemote>["mount"] }>,
) =>
  render(
    <MemoryRouter>
      <UiProvider mode="light">
        <RemoteRoute name="auth" load={load} services={fakeServices()} />
      </UiProvider>
    </MemoryRouter>,
  );

describe("RemoteRoute", () => {
  it("shows a loading bar, then the remote", async () => {
    renderRoute(() =>
      Promise.resolve({
        mount: fakeRemote((el) => void (el.textContent = "auth ready")).mount,
      }),
    );
    expect(screen.getByTestId("progress")).toBeInTheDocument();
    expect(await screen.findByText("auth ready")).toBeInTheDocument();
  });

  it("contains a load failure in an alert and retries with a fresh attempt", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    const load = jest
      .fn()
      .mockRejectedValueOnce(new Error("ChunkLoadError"))
      .mockResolvedValueOnce({
        mount: fakeRemote((el) => void (el.textContent = "auth ready")).mount,
      });

    renderRoute(load);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The auth module is unavailable",
    );

    await userEvent.click(screen.getByTestId("error-state-retry"));
    expect(await screen.findByText("auth ready")).toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(2);
  });
});
