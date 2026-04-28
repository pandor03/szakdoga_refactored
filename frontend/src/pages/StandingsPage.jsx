import { useEffect, useState } from "react";
import GameNav from "../components/GameNav";
import PageHero from "../components/PageHero";
import StatCard from "../components/StatCard";
import EmptyState from "../components/EmptyState";
import InlineLoader from "../components/InlineLoader";
import { useGameStore } from "../store/gameStore";
import { useScreenStore } from "../store/screenStore";
import TeamInfoModal from "../components/TeamInfoModal";

export default function StandingsPage() {
  const activeSaveId = useGameStore((state) => state.activeSaveId);

  const standingsScreen = useScreenStore((state) => state.standingsScreen);
  const isLoading = useScreenStore((state) => state.isLoadingStandingsScreen);
  const error = useScreenStore((state) => state.standingsScreenError);
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  const loadStandingsScreen = useScreenStore(
    (state) => state.loadStandingsScreen
  );

  const openTeamModal = (teamId) => {
    if (!teamId) return;
    setSelectedTeamId(teamId);
  };

  useEffect(() => {
    loadStandingsScreen(activeSaveId).catch(() => {});
  }, [activeSaveId, loadStandingsScreen]);

  if (isLoading && !standingsScreen) {
    return (
      <div className="page-shell">
        <div className="page-container">
          <InlineLoader text="Tabella betöltése..." />
        </div>
      </div>
    );
  }

  if (error && !standingsScreen) {
    return (
      <div className="page-shell">
        <div className="page-container">
          <div className="card">
            <p className="error-text">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!standingsScreen) {
    return (
      <div className="page-shell">
        <div className="page-container">
          <EmptyState title="Nincs tabella adat." />
        </div>
      </div>
    );
  }

  const table = standingsScreen.table || [];
  const isSeasonFinished =
    standingsScreen.season?.isSeasonFinished ||
    standingsScreen.season?.isFinished ||
    false;

  const leader = table[0];

  const selectedTeamShortName =
    standingsScreen.team?.shortName ||
    standingsScreen.selectedTeam?.shortName ||
    standingsScreen.myTeam?.shortName ||
    standingsScreen.selectedTeamShortName;

  const ownTeam =
    table.find((row) => selectedTeamId && row.team?.id === selectedTeamId) ||
    table.find(
      (row) =>
        selectedTeamShortName && row.team?.shortName === selectedTeamShortName
    ) ||
    table.find((row) => row.isSelectedTeam || row.isOwnTeam);

  return (
    <div className="page-shell">
      <div className="page-container">
        <PageHero
          kicker={isSeasonFinished ? "Final League Table" : "League Table"}
          title={isSeasonFinished ? "Végső tabella" : "Tabella"}
          subtitle={
            isSeasonFinished
              ? "A szezon véget ért"
              : `Szezon: ${standingsScreen.season?.currentRound}/${standingsScreen.season?.totalRounds}`
          }
        >
          <GameNav />
        </PageHero>

        {error && <p className="error-text">{error}</p>}

        <div className="stat-grid">
          <div
            className="clickable-stat-card"
            onClick={() => leader?.team?.id && openTeamModal(leader.team.id)}
          >
            <StatCard
              label={isSeasonFinished ? "Bajnok" : "Éllovas"}
              value={leader ? leader.team.name : "-"}
              helper={leader ? `${leader.points} pont` : "Nincs adat"}
            />
          </div>

          <StatCard
            label="Saját helyezés"
            value={ownTeam ? `${ownTeam.position}.` : "-"}
            helper={ownTeam ? `${ownTeam.points} pont` : "Nincs adat"}
          />

          <StatCard
            label={isSeasonFinished ? "Összes forduló lejátszva" : "Forduló"}
            value={
              isSeasonFinished
                ? "Szezon vége"
                : `${standingsScreen.season?.currentRound ?? "-"}/${
                    standingsScreen.season?.totalRounds ?? "-"
                  }`
            }
            helper={isSeasonFinished ? "A bajnokság lezárult" : "Szezon állása"}
          />
        </div>

        <section className="card">
          <div className="section-heading-row">
            <div>
              <h2>{isSeasonFinished ? "Végső bajnoki tabella" : "Bajnoki tabella"}</h2>
            </div>
          </div>

          {table.length ? (
            <div className="standings-table">
              <div className="standings-header">
                <span>#</span>
                <span>Csapat</span>
                <span>J</span>
                <span>Gy</span>
                <span>D</span>
                <span>V</span>
                <span>GF</span>
                <span>GA</span>
                <span>GD</span>
                <span>P</span>
              </div>

              {table.map((row) => {
                const isOwnTeam =
                  row.team?.id === standingsScreen.team?.id ||
                  row.team?.shortName === standingsScreen.team?.shortName;

                return (
                  <div
                    key={row.team.id}
                    className={`standings-row ${isOwnTeam ? "own-standing-row" : ""}`}
                  >
                    <span className="standing-position">
                      {row.position <= 3 ? (
                        <strong className={`podium-badge podium-${row.position}`}>
                          {row.position}
                        </strong>
                      ) : (
                        row.position
                      )}
                    </span>

                    <span
                      className="standing-team clickable-team"
                      onClick={() => openTeamModal(row.team.id)}
                    >
                      <strong>{row.team.name}</strong>
                      <small>{row.team.shortName}</small>
                    </span>

                    <span>{row.played}</span>
                    <span>{row.wins}</span>
                    <span>{row.draws}</span>
                    <span>{row.losses}</span>
                    <span>{row.goalsFor}</span>
                    <span>{row.goalsAgainst}</span>
                    <span>{row.goalDifference}</span>
                    <strong>{row.points}</strong>
                    {selectedTeamId && (
                      <TeamInfoModal
                        saveId={activeSaveId}
                        teamId={selectedTeamId}
                        onClose={() => setSelectedTeamId(null)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState title="Nincs megjeleníthető tabella." />
          )}
        </section>
      </div>
    </div>
  );
}