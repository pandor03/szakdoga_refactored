import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GameNav from "../components/GameNav";
import { useAuthStore } from "../store/authStore";
import { useDashboardStore } from "../store/dashboardStore";
import { useGameStore } from "../store/gameStore";

export default function DashboardPage() {
  const navigate = useNavigate();

  const logout = useAuthStore((state) => state.logout);

  const activeSaveId = useGameStore((state) => state.activeSaveId);
  const clearActiveSave = useGameStore((state) => state.clearActiveSave);

  const dashboard = useDashboardStore((state) => state.dashboard);
  const isLoadingDashboard = useDashboardStore(
    (state) => state.isLoadingDashboard
  );
  const dashboardError = useDashboardStore((state) => state.dashboardError);
  const loadDashboard = useDashboardStore((state) => state.loadDashboard);
  const resetDashboard = useDashboardStore((state) => state.resetDashboard);

  useEffect(() => {
    if (!activeSaveId) {
      resetDashboard();
      return;
    }

    loadDashboard(activeSaveId).catch(() => {});
  }, [activeSaveId, loadDashboard, resetDashboard]);

  const handleBackToSaves = () => {
    resetDashboard();
    clearActiveSave();
    navigate("/saves");
  };

  const handleLogout = () => {
    resetDashboard();
    clearActiveSave();
    logout();
    navigate("/login");
  };

  if (isLoadingDashboard) {
    return (
      <div className="page-shell">
        <div className="page-container">
          <div className="card">
            <p>Dashboard betöltése...</p>
          </div>
        </div>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="page-shell">
        <div className="page-container">
          <div className="card">
            <p className="error-text">{dashboardError}</p>

            <div className="row-gap">
              <button onClick={handleBackToSaves}>Vissza a mentésekhez</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="page-shell">
        <div className="page-container">
          <div className="card">
            <p>Nincs dashboard adat.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="top-row">
          <div>
            <h1>{dashboard.save.name}</h1>

            <p className="muted-text">
              Irányított csapat:{" "}
              <strong>
                {dashboard.selectedTeam?.name} (
                {dashboard.selectedTeam?.shortName})
              </strong>
            </p>
          </div>

          <div className="button-row">
            <GameNav />

            <button className="secondary-btn" onClick={handleBackToSaves}>
              Mentések
            </button>

            <button className="secondary-btn" onClick={handleLogout}>
              Kilépés
            </button>
          </div>
        </div>

        <div className="dashboard-grid">
          <section className="card">
            <h2>Szezon állapot</h2>

            <p>
              Forduló:{" "}
              <strong>
                {dashboard.seasonState.currentRound} /{" "}
                {dashboard.seasonState.totalRounds}
              </strong>
            </p>

            <p>Vége: {dashboard.seasonState.isFinished ? "Igen" : "Nem"}</p>
          </section>

          <section className="card">
            <h2>Tabella top 4</h2>

            {dashboard.standings?.slice(0, 4).map((row) => (
              <div key={row.team.id} className="table-row">
                <span>
                  {row.position}. {row.team.name}
                </span>

                <strong>{row.points} pont</strong>
              </div>
            ))}
          </section>

          <section className="card">
            <h2>Aktuális forduló</h2>

            {dashboard.currentRoundFixtures?.length ? (
              dashboard.currentRoundFixtures.map((fixture) => (
                <div key={fixture.id} className="fixture-row">
                  <span>
                    {fixture.homeTeam.shortName} - {fixture.awayTeam.shortName}
                  </span>

                  <strong>
                    {fixture.isPlayed
                      ? `${fixture.homeGoals}-${fixture.awayGoals}`
                      : "nincs eredmény"}
                  </strong>
                </div>
              ))
            ) : (
              <p>Nincs aktuális forduló adat.</p>
            )}
          </section>

          <section className="card">
            <h2>Előző forduló</h2>

            {dashboard.lastRoundFixtures?.length ? (
              dashboard.lastRoundFixtures.map((fixture) => (
                <div key={fixture.id} className="fixture-row">
                  <span>
                    {fixture.homeTeam.shortName} - {fixture.awayTeam.shortName}
                  </span>

                  <strong>
                    {fixture.homeGoals}-{fixture.awayGoals}
                  </strong>
                </div>
              ))
            ) : (
              <p>Még nincs lejátszott forduló.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}