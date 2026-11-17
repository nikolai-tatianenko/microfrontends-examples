import type { Mount } from "@blog/contract";
import { createApp } from "vue";
import App from "./App.vue";

/**
 * Same contract as the React remotes, implemented with Vue. The shell cannot tell the difference.
 * The dashboard has a single view, so host navigation needs no handling.
 */
export const mount: Mount = (el, { services }) => {
  const app = createApp(App, { services });
  app.mount(el);
  let mounted = true;
  return {
    onHostNavigate() {
      // The dashboard has a single screen, so there is no route to follow.
    },
    unmount() {
      if (!mounted) return;
      mounted = false;
      app.unmount();
    },
  };
};
