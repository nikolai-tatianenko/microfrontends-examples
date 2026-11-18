import { requireElement } from "@blog/contract";
import { getModeStore } from "@blog/tokens/mode";
import "@blog/tokens/tokens.css";
import { UiProvider } from "@blog/ui";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Shell } from "./Shell";
import { federatedRemotes } from "./remotes/registry";
import { createServices } from "./services";
import { hasSeenTour, markTourSeen } from "./tour/tourState";

// The shell owns the color mode: set it before the first render so the page never flashes the wrong one.
getModeStore();

// Offer the tour once. Marking it now (not when it ends) means a reload mid-tour does not start it again.
const autoStartTour = !hasSeenTour();
if (autoStartTour) markTourSeen();

createRoot(requireElement("root")).render(
  <StrictMode>
    <UiProvider baseline>
      <BrowserRouter>
        <Shell
          services={createServices()}
          remotes={federatedRemotes}
          autoStartTour={autoStartTour}
        />
      </BrowserRouter>
    </UiProvider>
  </StrictMode>,
);
