import { UiProvider } from "@blog/ui";
import { Route, Routes } from "react-router-dom";
import { AboutPage } from "./pages/AboutPage";
import { LandingPage } from "./pages/LandingPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PricingPage } from "./pages/PricingPage";

export function App() {
  return (
    <UiProvider>
      <Routes>
        <Route path="/blog" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </UiProvider>
  );
}
