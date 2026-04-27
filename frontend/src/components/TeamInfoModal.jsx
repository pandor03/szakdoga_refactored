import { useEffect, useState } from "react";
import { getTeamDetail, getTeamFixtures, getTeamPlayers } from "../api/screenApi";
import InlineLoader from "./InlineLoader";
import EmptyState from "./EmptyState";
import MatchCard from "./MatchCard";

const roleOrder = {
  starter: 1,
  bench: 2,
  reserve: 3,
};

export default function TeamInfoModal({ saveId, teamId, onClose }) {
  const [teamDetail, setTeamDetail] = useState(null);
  const [players, setPlayers] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!saveId || !teamId) return;

    setIsLoading(true);
    setError("");

    Promise.all([
      getTeamDetail(saveId, teamId),
      getTeamPlayers(saveId, teamId),
      getTeamFixtures(saveId, teamId),
    ])
      .then(([detailData, playersData, fixturesData]) => {
        setTeamDetail(detailData);
        setPlayers(Array.isArray(playersData) ? playersData : playersData.players || []);
        setFixtures(Array.isArray(fixturesData) ? fixturesData : fixturesData.fixtures || []);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || "Nem sikerült betölteni a csapat adatokat.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [saveId, teamId]);

  const starters = [...players]
    .filter(
        (player) =>
        player.role === "starter" ||
        player.lineupSlot ||
        player.lineupPosition
    )
    .sort((a, b) =>
        (a.lineupSlot || a.lineupPosition || "").localeCompare(
        b.lineupSlot || b.lineupPosition || ""
        )
    );

  const squadPlayers = [...players].sort((a, b) => {
    const roleDiff = (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99);
    if (roleDiff !== 0) return roleDiff;
    return b.overall - a.overall;
  });

  const recentFixtures = fixtures.slice(0, 4);

  return (
    <div className="modal-backdrop">
      <div className="team-info-modal">
        <button className="modal-close-btn" onClick={onClose}>
          ×
        </button>

        {isLoading ? (
          <InlineLoader text="Csapat betöltése..." />
        ) : error ? (
          <p className="error-text">{error}</p>
        ) : teamDetail ? (
          <>
            <span className="game-page-kicker">Team Info</span>

            <h2>
              {teamDetail.name || teamDetail.team?.name}{" "}
              <small>({teamDetail.shortName || teamDetail.team?.shortName})</small>
            </h2>

            <div className="team-info-grid">
              <section>
                <h3>Kezdő 11</h3>

                {starters.length ? (
                  <div className="team-lineup-list">
                    {starters.slice(0, 11).map((player) => (
                      <div key={player.id} className="team-lineup-row">
                        <span>
                          {player.lineupSlot || player.lineupPosition || player.position}
                        </span>

                        <strong>{player.name}</strong>

                        <em>{player.overall}</em>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="Nincs kezdő adat." />
                )}
              </section>

              <section>
                <h3>Keret</h3>

                {squadPlayers.length ? (
                  <div className="team-squad-scroll">
                    {squadPlayers.map((player) => (
                      <div key={player.id} className="team-squad-row">
                        <div>
                          <strong>{player.name}</strong>
                          <p className="muted-text">
                            {player.position} | {player.role || "squad"}
                          </p>
                        </div>

                        <span>{player.overall}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="Nincs keret adat." />
                )}
              </section>
            </div>

            <section className="team-fixtures-section">
              <h3>Meccsek</h3>

              {recentFixtures.length ? (
                <div className="compact-match-list">
                  {recentFixtures.map((fixture) => (
                    <MatchCard key={fixture.id} fixture={fixture} />
                  ))}
                </div>
              ) : (
                <EmptyState title="Nincs meccs adat." />
              )}
            </section>
          </>
        ) : (
          <EmptyState title="Nincs csapat adat." />
        )}
      </div>
    </div>
  );
}