import { useEffect, useState } from "react";
import GameNav from "../components/GameNav";
import PageHero from "../components/PageHero";
import MatchCard from "../components/MatchCard";
import EmptyState from "../components/EmptyState";
import InlineLoader from "../components/InlineLoader";
import { useGameStore } from "../store/gameStore";
import { useScreenStore } from "../store/screenStore";
import TeamInfoModal from "../components/TeamInfoModal";
import MatchInfoModal from "../components/MatchInfoModal";

export default function FixturesPage() {
  const activeSaveId = useGameStore((state) => state.activeSaveId);

  const fixturesScreen = useScreenStore((state) => state.fixturesScreen);
  const isLoading = useScreenStore((state) => state.isLoadingFixturesScreen);
  const error = useScreenStore((state) => state.fixturesScreenError);

  const isPlayingRound = useScreenStore((state) => state.isPlayingRound);
  const loadFixturesScreen = useScreenStore((state) => state.loadFixturesScreen);
  const playRound = useScreenStore((state) => state.playRound);

  const [roundSummary, setRoundSummary] = useState(null);

  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [selectedFixture, setSelectedFixture] = useState(null);

  useEffect(() => {
    loadFixturesScreen(activeSaveId).catch(() => {});
  }, [activeSaveId, loadFixturesScreen]);

  const myFixture = fixturesScreen?.myMatch?.fixture;
  const standings = fixturesScreen?.standings || [];

  const playedOtherMatches = fixturesScreen?.otherMatches?.played || [];
  const remainingOtherMatches = fixturesScreen?.otherMatches?.remaining || [];
  const allOtherMatches = [...playedOtherMatches, ...remainingOtherMatches];

  const canPlayRound = Number(fixturesScreen?.round?.remainingFixtures || 0) > 0;

  const handlePlayRound = async () => {
    const result = await playRound(activeSaveId).catch(() => null);

    if (result) {
      setRoundSummary(result);
    }
  };

  const openTeamModal = (teamId) => {
    if (!teamId) return;
    setSelectedFixture(null);
    setSelectedTeamId(teamId);
  };

  const openMatchModal = (fixture) => {
    if (!fixture) return;
    setSelectedTeamId(null);
    setSelectedFixture(fixture);
  };

  if (isLoading && !fixturesScreen) {
    return (
      <div className="page-shell">
        <div className="page-container">
          <InlineLoader text="Meccsek betöltése..." />
        </div>
      </div>
    );
  }

  if (error && !fixturesScreen) {
    return (
      <div className="page-shell">
        <div className="page-container">
          <div className="card">
            <p className="error-text">{error}</p>
            <GameNav />
          </div>
        </div>
      </div>
    );
  }

  if (!fixturesScreen) {
    return (
      <div className="page-shell">
        <div className="page-container">
          <EmptyState title="Nincs meccs adat." />
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-container">
        <PageHero
          kicker="Match Center"
          title="Meccsek"
          subtitle={`Forduló: ${fixturesScreen.round?.roundNumber || "-"}`}
        >
          <GameNav />
        </PageHero>

        {error && <p className="error-text">{error}</p>}

        <div className="fixtures-layout">
          <section className="card fixture-main-card">
            <div className="section-heading-row">
              <div>
                <h2>Saját meccs</h2>
                <p className="muted-text">
                  A forduló összes mérkőzése egyszerre szimulálódik.
                </p>
              </div>
            </div>

            {myFixture ? (
  <>
              <MatchCard
                fixture={myFixture}
                onClick={() => openMatchModal(myFixture)}
                onTeamClick={openTeamModal}
              />

              {canPlayRound ? (
                <button disabled={isPlayingRound} onClick={handlePlayRound}>
                  {isPlayingRound
                    ? "Forduló szimulálása..."
                    : "Forduló lejátszása"}
                </button>
              ) : (
                <div className="success-text">
                  A forduló mérkőzései lejátszva.
                </div>
              )}
            </>
          ) : (
            <EmptyState title="Nincs saját meccs ebben a fordulóban." />
          )}
          </section>

          <section className="card fixtures-standings-card">
            <h2>Tabella</h2>

            {standings.length ? (
              <div className="fixtures-standings-scroll">
                {standings.map((row) => (
                  <div
                    key={row.team.id}
                    className={`fixtures-standings-row ${
                      row.team.id === fixturesScreen.myMatch?.team?.id
                        ? "own-team-row"
                        : ""
                    }`}
                  >
                    <span
                      className="clickable-team"
                      onClick={() => openTeamModal(row.team.id)}
                    >
                      {row.position}. {row.team.shortName}
                    </span>

                    <strong>{row.points}p</strong>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="Nincs tabella adat." />
            )}
          </section>
        </div>

        <div className="fixtures-layout secondary-fixtures-layout">
          <section className="card">
            <h2>Többi meccs</h2>

            {allOtherMatches.length ? (
              <div className="compact-match-list">
                {allOtherMatches.map((fixture) => (
                  <MatchCard
                    fixture={fixture}
                    onClick={() => openMatchModal(fixture)}
                    onTeamClick={openTeamModal}
                  />
                ))}
              </div>
            ) : (
              <EmptyState title="Nincs további meccs." />
            )}
          </section>

          <section className="card">
            <h2>Saját meccsek fordulónként</h2>

            {fixturesScreen.roundsOverview?.rounds?.length ? (
              <div className="round-list">
                {fixturesScreen.roundsOverview.rounds.map((round) => (
                  <div
                    key={round.roundNumber}
                    className={`round-card ${
                      round.isCurrent ? "current-round-card" : ""
                    }`}
                  >
                    <div>
                      <strong>{round.roundNumber}. forduló</strong>
                      {round.isCurrent && <span>Aktuális</span>}

                      {round.selectedTeamFixture && (
                        <p className="muted-text">
                          {round.selectedTeamFixture.homeTeam.shortName} -{" "}
                          {round.selectedTeamFixture.awayTeam.shortName}
                        </p>
                      )}
                    </div>

                    <p>
                      {round.selectedTeamFixture?.isPlayed
                        ? `${round.selectedTeamFixture.homeGoals}-${round.selectedTeamFixture.awayGoals}`
                        : "nincs eredmény"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="Nincs forduló áttekintés." />
            )}
          </section>
        </div>
      </div>

      {roundSummary && (
        <div className="modal-backdrop">
          <div className="round-summary-modal">
            <button
              className="modal-close-btn"
              onClick={() => setRoundSummary(null)}
            >
              ×
            </button>

            <span className="game-page-kicker">Round Summary</span>
            <h2>{roundSummary.roundNumber}. forduló eredményei</h2>

            {roundSummary.myFixture && (
              <div className="round-summary-section">
                <h3>Saját meccs</h3>
                <MatchCard
                  fixture={roundSummary.myFixture}
                  onClick={() => openMatchModal(roundSummary.myFixture)}
                  onTeamClick={openTeamModal}
                />
              </div>
            )}

            <div className="round-summary-section">
              <h3>Többi meccs</h3>

              <div className="compact-match-list">
                {roundSummary.fixtures
                  ?.filter((fixture) => fixture.id !== roundSummary.myFixture?.id)
                  .map((fixture) => (
                    <MatchCard
                      key={fixture.id}
                      fixture={fixture}
                      onClick={() => openMatchModal(fixture)}
                      onTeamClick={openTeamModal}
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTeamId && (
        <TeamInfoModal
          saveId={activeSaveId}
          teamId={selectedTeamId}
          onClose={() => setSelectedTeamId(null)}
        />
      )}

      {selectedFixture && (
        <MatchInfoModal
          fixture={selectedFixture}
          saveId={activeSaveId}
          onClose={() => setSelectedFixture(null)}
          onTeamClick={openTeamModal}
        />
      )}
    </div>
  );
}