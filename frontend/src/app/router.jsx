import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import SaveSelectorPage from "../pages/SaveSelectorPage";
import DashboardPage from "../pages/DashboardPage";
import SquadPage from "../pages/SquadPage";
import TransferPage from "../pages/TransferPage";
import FixturesPage from "../pages/FixturesPage";
import StandingsPage from "../pages/StandingsPage";

import ProtectedRoute from "../components/ProtectedRoute";
import SaveRequiredRoute from "../components/SaveRequiredRoute";

function AppBootstrap({ children }) {
  const token = useAuthStore((state) => state.token);
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const finishBootstrapWithoutAuth = useAuthStore(
    (state) => state.finishBootstrapWithoutAuth
  );

  useEffect(() => {
    if (!isBootstrapping) return;

    if (!token) {
      finishBootstrapWithoutAuth();
      return;
    }

    fetchMe().catch(() => {});
  }, [token, isBootstrapping, fetchMe, finishBootstrapWithoutAuth]);

  return children;
}

function ProtectedGamePage({ children }) {
  return (
    <ProtectedRoute>
      <SaveRequiredRoute>{children}</SaveRequiredRoute>
    </ProtectedRoute>
  );
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
              <ProtectedGamePage>
                <DashboardPage />
              </ProtectedGamePage>
            }
          />

          <Route
            path="/squad"
            element={
              <ProtectedGamePage>
                <SquadPage />
              </ProtectedGamePage>
            }
          />

          <Route
            path="/transfer"
            element={
              <ProtectedGamePage>
                <TransferPage />
              </ProtectedGamePage>
            }
          />

          <Route
            path="/fixtures"
            element={
              <ProtectedGamePage>
                <FixturesPage />
              </ProtectedGamePage>
            }
          />

          <Route
            path="/standings"
            element={
              <ProtectedGamePage>
                <StandingsPage />
              </ProtectedGamePage>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AppBootstrap>
    </BrowserRouter>
  );
}