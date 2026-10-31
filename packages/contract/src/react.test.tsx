import { act, screen, waitFor } from "@testing-library/react";
import { useLocation, useNavigate } from "react-router-dom";
import { createSessionStore, type Services } from ".";
import { createReactRemote } from "./react";

// Real React root + real MemoryRouter; only Apollo is a stand-in (the provider just needs a client object).
const services = (): Services => ({
  session: createSessionStore(),
  apollo: {} as Services["apollo"],
});

let goInside: (path: string) => void;
function Page() {
  const { pathname } = useLocation();
  goInside = useNavigate();
  return <p data-test-id="where">{pathname}</p>;
}

function setup(initialPath = "/pricing") {
  const el = document.createElement("div");
  document.body.append(el);
  const onNavigate = jest.fn();
  const handle = createReactRemote(Page)(el, {
    initialPath,
    services: services(),
    onNavigate,
  });
  return { el, onNavigate, handle };
}

describe("createReactRemote", () => {
  afterEach(() => void (document.body.innerHTML = ""));

  it("renders the app at the host's current path", async () => {
    setup("/pricing");
    expect(await screen.findByTestId("where")).toHaveTextContent("/pricing");
  });

  it("follows the host when the host navigates", async () => {
    const { handle } = setup("/pricing");
    await screen.findByTestId("where");
    act(() => handle.onHostNavigate("/about"));
    expect(screen.getByTestId("where")).toHaveTextContent("/about");
  });

  it("reports the remote's own navigation to the host", async () => {
    const { onNavigate } = setup("/pricing");
    await screen.findByTestId("where");
    act(() => goInside("/about"));
    expect(onNavigate).toHaveBeenLastCalledWith("/about");
  });

  it("ignores a host navigation to the path it is already on", async () => {
    const { handle, onNavigate } = setup("/pricing");
    await screen.findByTestId("where");
    onNavigate.mockClear();
    act(() => handle.onHostNavigate("/pricing"));
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("unmounts once, and a second unmount is a no-op", async () => {
    const { handle, el } = setup();
    await screen.findByTestId("where");
    act(() => handle.unmount());
    // Unmounting is deferred one microtask so it never runs inside the host's commit.
    await waitFor(() => expect(el).toBeEmptyDOMElement());
    expect(() => handle.unmount()).not.toThrow();
  });
});
