import { render, screen, act } from "@testing-library/react";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import { fakeRemote, fakeServices } from "../test-utils";
import { RemoteHost } from "./RemoteHost";

let go: (path: string) => void;
function Nav() {
  const navigate = useNavigate();
  go = navigate;
  return <output data-test-id="location">{useLocation().pathname}</output>;
}

const setup = (remote = fakeRemote()) => {
  const services = fakeServices();
  const utils = render(
    <MemoryRouter initialEntries={["/pricing"]}>
      <Nav />
      <RemoteHost mount={remote.mount} services={services} />
    </MemoryRouter>,
  );
  return { ...utils, remote, services };
};

describe("RemoteHost", () => {
  it("mounts the remote at the current path with the host's services", () => {
    const { remote, services } = setup();
    expect(remote.calls.mount).toHaveLength(1);
    expect(remote.calls.mount[0]?.initialPath).toBe("/pricing");
    expect(remote.calls.mount[0]?.services).toBe(services);
  });

  it("tells the remote when the host URL changes", () => {
    const { remote } = setup();
    act(() => go("/about"));
    expect(remote.calls.navigate.at(-1)).toBe("/about");
  });

  it("keeps the same remote instance across host navigations (no remount)", () => {
    const { remote } = setup();
    act(() => go("/about"));
    act(() => go("/pricing"));
    expect(remote.calls.mount).toHaveLength(1);
    expect(remote.calls.unmount).toBe(0);
  });

  it("mirrors remote navigation into the host URL without echoing it back", () => {
    const { remote } = setup();
    const { onNavigate } = remote.calls.mount[0]!;

    act(() => onNavigate?.("/pricing")); // remote reports where everyone already is
    expect(screen.getByTestId("location")).toHaveTextContent("/pricing");

    act(() => onNavigate?.("/about"));
    expect(screen.getByTestId("location")).toHaveTextContent("/about");
    expect(remote.calls.navigate).toEqual([]); // the remote already knows
  });

  it("unmounts the remote and removes its DOM on teardown", () => {
    const { remote, unmount, container } = setup(
      fakeRemote((el) => void (el.textContent = "remote content")),
    );
    expect(container).toHaveTextContent("remote content");
    unmount();
    expect(remote.calls.unmount).toBe(1);
    expect(container).not.toHaveTextContent("remote content");
  });
});
