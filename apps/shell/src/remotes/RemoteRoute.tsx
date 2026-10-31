import type { Services } from "@blog/contract";
import { ErrorState, Progress } from "@blog/ui";
import {
  Component,
  Suspense,
  lazy,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { OwnerFrame } from "./OwnerFrame";
import type { OwnerName } from "./owners";
import { RemoteHost } from "./RemoteHost";
import type { RemoteLoader } from "./registry";

interface BoundaryProps {
  name: string;
  onRetry: () => void;
  children: ReactNode;
}

/** Contains a failing remote (network error, bad deploy, runtime throw) so the shell stays usable. */
class RemoteBoundary extends Component<BoundaryProps, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <ErrorState
        title={`The ${this.props.name} module is unavailable`}
        message="The rest of the site still works. Try again in a moment."
        onRetry={() => {
          this.setState({ error: null });
          this.props.onRetry();
        }}
      />
    );
  }
}

interface RemoteRouteProps {
  name: OwnerName;
  load: RemoteLoader;
  services: Services;
  /** Outline the remote and name it (the "Show micro-apps" overlay). */
  showOwner?: boolean;
}

/** Loads a remote lazily, with a loading bar and an isolated, retryable failure state. */
export function RemoteRoute({
  name,
  load,
  services,
  showOwner = false,
}: RemoteRouteProps) {
  // A rejected `lazy()` is cached forever; a new attempt needs a new lazy component.
  const [attempt, setAttempt] = useState(0);
  const Remote = useMemo(
    () =>
      lazy(() =>
        load().then(({ mount }) => ({
          default: () => <RemoteHost mount={mount} services={services} />,
        })),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `attempt` is the retry trigger
    [load, services, attempt],
  );

  return (
    <RemoteBoundary name={name} onRetry={() => setAttempt((n) => n + 1)}>
      <OwnerFrame owner={name} visible={showOwner}>
        <Suspense fallback={<Progress />}>
          <Remote />
        </Suspense>
      </OwnerFrame>
    </RemoteBoundary>
  );
}
