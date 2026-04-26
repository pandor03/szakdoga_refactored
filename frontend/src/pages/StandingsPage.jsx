import { useEffect } from "react";
import GameNav from "../components/GameNav";
import { useGameStore } from "../store/gameStore";
import { useScreenStore } from "../store/screenStore";

export default function StandingsPage() {
  const activeSaveId = useGameStore((state) => state.activeSaveId);

  const standingsScreen = useScreenStore((state) => state.standingsScreen);
  const isLoading = useScreenStore((state) => state.isLoadingStandingsScreen);
  const error = useScreenStore((state) => state.standingsScreenError);
  const loadStandingsScreen = useScreenStore(
    (state) => state.loadStandingsScreen
  );

  useEffect(() => {
    loadStandingsScreen(activeSaveId).catch(() => {});
  }, [activeSaveId, loadStandingsScreen]);

  if (isLoading) {
    return (
      <div className="page-shell">
        <div className="page-container">
          <p>Tabella betöltése...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell">
        <div className="page-container">
          <p className="error-text">{error}</p>
        </div>
      </div>
    );
  }

  if (!standingsScreen) {
    return (
      <div className="page-shell">
        <div className="page-container">
          <p>Nincs tabella adat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="top-row">
          <div>
            <h1>Tabella</h1>
            <p className="muted-text">
              Szezon: {standingsScreen.season?.currentRound}/
              {standingsScreen.season?.totalRounds}
            </p>
          </div>

          <GameNav />
        </div>

        <section className="card">
          <h2>Bajnoki tabella</h2>

          {standingsScreen.table?.map((row) => (
            <div key={row.team.id} className="table-row">
              <span>
                {row.position}. {row.team.name} ({row.team.shortName}) |{" "}
                {row.wins}-{row.draws}-{row.losses} | GD:{" "}
                {row.goalDifference}
              </span>
              <strong>{row.points} pont</strong>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}