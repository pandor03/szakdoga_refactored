import { useEffect, useState } from "react";
import GameNav from "../components/GameNav";
import { useGameStore } from "../store/gameStore";
import { useScreenStore } from "../store/screenStore";

export default function FixturesPage() {
  const activeSaveId = useGameStore((state) => state.activeSaveId);

  const fixturesScreen = useScreenStore((state) => state.fixturesScreen);
  const isLoading = useScreenStore((state) => state.isLoadingFixturesScreen);
  const error = useScreenStore((state) => state.fixturesScreenError);

  const isPlayingMyMatch = useScreenStore((state) => state.isPlayingMyMatch);
  const isSimulatingRound = useScreenStore((state) => state.isSimulatingRound);
  const isCompletingRound = useScreenStore((state) => state.isCompletingRound);

  const loadFixturesScreen = useScreenStore((state) => state.loadFixturesScreen);
  const playMyMatch = useScreenStore((state) => state.playMyMatch);
  const simulateRestOfRound = useScreenStore(
    (state) => state.simulateRestOfRound
  );
  const completeRound = useScreenStore((state) => state.completeRound);

  const [manualResult, setManualResult] = useState({
    homeGoals: 1,
    awayGoals: 0,
  });

  useEffect(() => {
    loadFixturesScreen(activeSaveId).catch(() => {});
  }, [activeSaveId, loadFixturesScreen]);

  const myFixture = fixturesScreen?.myMatch?.fixture;
  const actions = fixturesScreen?.actions;

  const handlePlayMyMatch = async () => {
    await playMyMatch(activeSaveId, {
      homeGoals: Number(manualResult.homeGoals),
      awayGoals: Number(manualResult.awayGoals),
    }).catch(() => {});
  };

  const handleSimulateRest = async () => {
    await simulateRestOfRound(activeSaveId).catch(() => {});
  };

  const handleCompleteRound = async () => {
    await completeRound(activeSaveId).catch(() => {});
  };

  const isActionRunning =
    isPlayingMyMatch || isSimulatingRound || isCompletingRound;

  if (isLoading) {
    return (
      <div className="page-shell">
        <div className="page-container">
          <p>Meccsek betöltése...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell">
        <div className="page-container">
          <p className="error-text">{error}</p>
          <GameNav />
        </div>
      </div>
    );
  }

  if (!fixturesScreen) {
    return (
      <div className="page-shell">
        <div className="page-container">
          <p>Nincs meccs adat.</p>
          <GameNav />
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="top-row">
          <div>
            <h1>Meccsek</h1>
            <p className="muted-text">
              Forduló: {fixturesScreen.round?.roundNumber}
            </p>
          </div>

          <GameNav />
        </div>

        <div className="dashboard-grid">
          <section className="card">
            <h2>Saját meccs</h2>

            {myFixture ? (
              <>
                <p>
                  {myFixture.homeTeam?.name} - {myFixture.awayTeam?.name}
                </p>

                <p>
                  Eredmény:{" "}
                  {myFixture.isPlayed
                    ? `${myFixture.homeGoals}-${myFixture.awayGoals}`
                    : "nincs lejátszva"}
                </p>

                {!myFixture.isPlayed && (
                  <div className="form-stack">
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={manualResult.homeGoals}
                      onChange={(e) =>
                        setManualResult((prev) => ({
                          ...prev,
                          homeGoals: e.target.value,
                        }))
                      }
                    />

                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={manualResult.awayGoals}
                      onChange={(e) =>
                        setManualResult((prev) => ({
                          ...prev,
                          awayGoals: e.target.value,
                        }))
                      }
                    />

                    <button
                      disabled={!actions?.canPlayMyMatch || isActionRunning}
                      onClick={handlePlayMyMatch}
                    >
                      {isPlayingMyMatch
                        ? "Meccs lejátszása..."
                        : "Saját meccs lejátszása"}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p>Nincs saját meccs.</p>
            )}
          </section>

          <section className="card">
            <h2>Forduló akciók</h2>

            <p>Összes meccs: {fixturesScreen.round?.totalFixtures}</p>
            <p>Lejátszott: {fixturesScreen.round?.playedFixtures}</p>
            <p>Hátralévő: {fixturesScreen.round?.remainingFixtures}</p>

            <div className="form-stack">
              <button
                disabled={
                  !actions?.canSimulateRemainingFixtures || isActionRunning
                }
                onClick={handleSimulateRest}
              >
                {isSimulatingRound
                  ? "Szimulálás..."
                  : "Többi meccs szimulálása"}
              </button>

              <button
                disabled={!actions?.canCompleteCurrentRound || isActionRunning}
                onClick={handleCompleteRound}
              >
                {isCompletingRound
                  ? "Forduló befejezése..."
                  : "Forduló befejezése automatikusan"}
              </button>
            </div>
          </section>

          <section className="card">
            <h2>Többi meccs</h2>

            {fixturesScreen.otherMatches?.played?.map((fixture) => (
              <div key={fixture.id} className="fixture-row">
                <span>
                  {fixture.homeTeam.shortName} - {fixture.awayTeam.shortName}
                </span>
                <strong>
                  {fixture.homeGoals}-{fixture.awayGoals}
                </strong>
              </div>
            ))}

            {fixturesScreen.otherMatches?.remaining?.map((fixture) => (
              <div key={fixture.id} className="fixture-row">
                <span>
                  {fixture.homeTeam.shortName} - {fixture.awayTeam.shortName}
                </span>
                <strong>nincs eredmény</strong>
              </div>
            ))}
          </section>

          <section className="card">
            <h2>Fordulók</h2>

            {fixturesScreen.roundsOverview?.rounds?.map((round) => (
              <div key={round.roundNumber} className="table-row">
                <span>
                  {round.roundNumber}. forduló{" "}
                  {round.isCurrent ? "(aktuális)" : ""}
                </span>

                <strong>
                  {round.playedFixtures}/{round.totalFixtures}
                </strong>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}