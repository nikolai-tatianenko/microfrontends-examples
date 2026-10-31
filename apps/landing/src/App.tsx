import "./landing.css";
import { LandingPage } from "./LandingPage";

/**
 * Styled with shadcn/ui + Tailwind v4, unlike the MUI remotes around it. Everything it needs is scoped
 * under `.landing-root` (see landing.css), so its styles cannot leak into the other remotes.
 */
export function App() {
  return (
    <div className="landing-root">
      <LandingPage />
    </div>
  );
}
