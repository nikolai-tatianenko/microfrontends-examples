import { UiProvider } from "@blog/ui";
import type { Services } from "@blog/contract";
import { Navigate, Route, Routes } from "react-router-dom";
import { CredentialsPage } from "./pages/CredentialsPage";

export function App({ services }: { services: Services }) {
  return (
    <UiProvider>
      <Routes>
        <Route
          path="/auth/signin"
          element={<CredentialsPage mode="signin" session={services.session} />}
        />
        <Route
          path="/auth/signup"
          element={<CredentialsPage mode="signup" session={services.session} />}
        />
        <Route path="*" element={<Navigate to="/auth/signin" replace />} />
      </Routes>
    </UiProvider>
  );
}
