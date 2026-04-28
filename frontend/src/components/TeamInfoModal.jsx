import { useEffect, useState } from "react";
import { getTeamDetail, getTeamFixtures, getTeamPlayers } from "../api/screenApi";
import InlineLoader from "./InlineLoader";
import EmptyState from "./EmptyState";
import MatchCard from "./MatchCard";
import MatchInfoModal from "./MatchInfoModal";

const normalizePosition = (value) => {
  if (!value) return "";

  return String(value)
    .toUpperCase()
    .replace(/[0-9]/g, "")
    .replace("_", "")
    .trim();
};

const getFitData = (player) => {
  const playerPosition = normalizePosition(player.position);
  const targetPosition = normalizePosition(
    player.lineupPosition || player.tacticalPosition || player.position
  );

  if (playerPosition === targetPosition) {
    return { multiplier: 1, className: "fit-good" };
  }

  const midfieldPositions = ["CM", "CDM", "CAM"];

  if (
    midfieldPositions.includes(playerPosition) &&
    midfieldPositions.includes(targetPosition)
  ) {
    return { multiplier: 0.9, className: "fit-ok" };
  }

  return { multiplier: 0.75, className: "fit-bad" };
};

const getRawOverall = (player) =>
  player.overall ?? player.rating ?? player.ovr ?? player.stats?.overall ?? "-";

const getFitOverall = (player) => {
  if (player.effectiveOverall !== undefined && player.effectiveOverall !== null) {
    return player.effectiveOverall;
  }

  const rawOverall = Number(getRawOverall(player));

  if (Number.isNaN(rawOverall)) {
    return "-";
  }

  return Math.round(rawOverall * getFitData(player).multiplier);
};

const getTeamOverall = (players) => {
  const values = players
    .slice(0, 11)
    .map((player) => Number(getFitOverall(player)))
    .filter((value) => !Number.isNaN(value));

  if (!values.length) return "-";

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
};

function PlayerStatsTooltip({ player }) {
  return (
    <div className="player-tooltip">
      <strong>{player.name}</strong>
      <p>
        {player.position} | OVR: {getRawOverall(player)}
      </p>

      {["pace", "shooting", "passing", "dribbling", "defending", "physical"].map(
        (stat) => (
          <div key={stat} className="tooltip-stat-row">
            <span>{stat}</span>
            <strong>{player[stat] ?? "-"}</strong>
          </div>
        )
      )}
    </div>
  );
}

function PlayerInfoRow({ player, useFitOverall = false }) {
  const fit = getFitData(player);
  const displayedOverall = useFitOverall ? getFitOverall(player) : getRawOverall(player);

  return (
    <div className="team-lineup-row player-info-hover-row">
      <strong>{player.name}</strong>
      <span>{player.position}</span>
      <span className={`team-lineup-ovr ${useFitOverall ? fit.className : "raw-ovr"}`}>
        {displayedOverall}
      </span>

      <PlayerStatsTooltip player={player} />
    </div>
  );
}

export default function TeamInfoModal({ saveId, teamId, onClose }) {
  const [teamDetail, setTeamDetail] = useState(null);
  const [players, setPlayers] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [selectedFixture, setSelectedFixture] = useState(null);
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

        const normalizedPlayers = Array.isArray(playersData)
          ? playersData
          : playersData?.players ||
            playersData?.team?.players ||
            detailData?.players ||
            [];

        const normalizedFixtures = Array.isArray(fixturesData)
          ? fixturesData
          : fixturesData?.fixtures ||
            [
              ...(detailData?.lastFixtures || []),
              ...(detailData?.upcomingFixtures || []),
            ];

        setPlayers(normalizedPlayers);
        setFixtures(normalizedFixtures);
      })
      .catch((err) => {
        setError(
          err?.response?.data?.message ||
            "Nem sikerült betölteni a csapat adatokat."
        );
      })
      .finally(() => setIsLoading(false));
  }, [saveId, teamId]);

  const team = teamDetail?.team || teamDetail;

  const starterCandidates = players.filter(
    (p) => p.role === "starter" || p.lineupSlot || p.lineupPosition
  );

  const starters =
    starterCandidates.length > 0
      ? starterCandidates
      : [...players]
          .sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))
          .slice(0, 11);

  const teamOverall = getTeamOverall(starters);

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
        ) : (
          <>
            <span className="game-page-kicker">Team Info</span>

            <h2>
              {team?.name}
              <small> ({team?.shortName})</small>
              <strong className="team-info-overall">OVR {teamOverall}</strong>
            </h2>

            <p className="muted-text">
              Formáció:{" "}
              {teamDetail?.formation ||
                teamDetail?.team?.formation ||
                team?.formation ||
                "-"}
            </p>

            <div className="team-info-grid">
              <section>
                <h3>Kezdő 11</h3>

                <div className="team-lineup-list">
                  {starters.slice(0, 11).map((player) => (
                    <PlayerInfoRow
                      key={player.id}
                      player={player}
                      useFitOverall
                    />
                  ))}
                </div>
              </section>

              <section>
                <h3>Keret</h3>

                <div className="team-squad-scroll">
                  {players.map((player) => (
                    <PlayerInfoRow key={player.id} player={player} />
                  ))}
                </div>
              </section>
            </div>

            <section className="team-fixtures-section">
              <h3>Meccsek</h3>

              {fixtures.length ? (
                <div className="compact-match-list">
                  {fixtures.slice(0, 6).map((fixture) => (
                    <MatchCard
                      key={fixture.id}
                      fixture={fixture}
                      onClick={() => setSelectedFixture(fixture)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState title="Nincs meccs adat." />
              )}
            </section>
          </>
        )}

        {selectedFixture && (
          <MatchInfoModal
            fixture={selectedFixture}
            saveId={saveId}
            onClose={() => setSelectedFixture(null)}
            onTeamClick={() => {}}
          />
        )}
      </div>
    </div>
  );
}