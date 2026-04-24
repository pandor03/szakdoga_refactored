import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import SaveSelectorPage from "../pages/SaveSelectorPage";
import DashboardPage from "../pages/DashboardPage";
import ProtectedRoute from "../components/ProtectedRoute";
import SaveRequiredRoute from "../components/SaveRequiredRoute";

function AppBootstrap({ children }) {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const finishBootstrapWithoutAuth = useAuthStore(
    (state) => state.finishBootstrapWithoutAuth
  );
  const finishBootstrapWithStoredAuth = useAuthStore(
    (state) => state.finishBootstrapWithStoredAuth
  );

  useEffect(() => {
    if (!token) {
      finishBootstrapWithoutAuth();
      return;
    }

    if (user) {
      finishBootstrapWithStoredAuth();
      return;
    }

    fetchMe().catch(() => {});
  }, [
    token,
    user,
    fetchMe,
    finishBootstrapWithoutAuth,
    finishBootstrapWithStoredAuth,
  ]);

  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AppBootstrap>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/saves"
            element={
              <ProtectedRoute>
                <SaveSelectorPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <SaveRequiredRoute>
                  <DashboardPage />
                </SaveRequiredRoute>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AppBootstrap>
    </BrowserRouter>
  );
}