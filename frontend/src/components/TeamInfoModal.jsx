import { useEffect, useState } from "react";
import {
  getSquadScreen,
  getTeamDetail,
  getTeamFixtures,
  getTeamPlayers,
} from "../api/screenApi";
import InlineLoader from "./InlineLoader";
import EmptyState from "./EmptyState";
import MatchCard from "./MatchCard";
import MatchInfoModal from "./MatchInfoModal";
import {
  getDisplayedPosition,
  getFitData,
  getFitOverall,
  getRawOverall,
  getTeamFitOverall,
} from "../utils/positionFit";

const uniquePlayers = (players) => {
  const map = new Map();

  players.filter(Boolean).forEach((player) => {
    map.set(player.id, player);
  });

  return Array.from(map.values());
};

const mapLineupSlotsToPlayers = (slots = []) =>
  slots
    .map((slot) =>
      slot.player
        ? {
            ...slot.player,
            playedPosition: slot.tacticalPosition,
            tacticalPosition: slot.tacticalPosition,
            lineupSlot: slot.slotId,
          }
        : null
    )
    .filter(Boolean);

function PlayerStatsTooltip({ player }) {
  return (
    <div className="player-tooltip">
      <strong>{player.name}</strong>

      <p>
        Saját poszt: {player.position || "-"} | Felállás poszt:{" "}
        {getDisplayedPosition(player) || "-"}
      </p>

      <p>
        OVR: {getRawOverall(player)} | Fit OVR: {getFitOverall(player)}
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

function PlayerInfoRow({ player, useFitOverall = false, showLineupPosition = false }) {
  const fit = getFitData(player);
  const displayedOverall = useFitOverall ? getFitOverall(player) : getRawOverall(player);
  const displayedPosition = showLineupPosition
    ? getDisplayedPosition(player)
    : player.position;

  return (
    <div className="team-lineup-row player-info-hover-row">
      <strong>{player.name}</strong>

      <span>{displayedPosition || "-"}</span>

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
  const [lineupSlots, setLineupSlots] = useState([]);
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
      getSquadScreen(saveId).catch(() => null),
    ])
      .then(([detailData, playersData, fixturesData, squadScreen]) => {
        const isSelectedTeam = squadScreen?.team?.id === teamId;

        setTeamDetail(
          isSelectedTeam
            ? {
                ...detailData,
                team: {
                  ...(detailData?.team || {}),
                  ...(squadScreen?.team || {}),
                },
                formation: squadScreen?.team?.formation || squadScreen?.lineup?.formation,
              }
            : detailData
        );

        const normalizedFixtures = Array.isArray(fixturesData)
          ? fixturesData
          : fixturesData?.fixtures ||
            [
              ...(detailData?.lastFixtures || []),
              ...(detailData?.upcomingFixtures || []),
            ];

        if (isSelectedTeam) {
          const previewSlots = squadScreen?.lineup?.preview || [];
          const starters = mapLineupSlotsToPlayers(previewSlots);
          const bench = squadScreen?.lineup?.bench || [];
          const reserve = squadScreen?.lineup?.reserve || [];

          setLineupSlots(previewSlots);
          setPlayers(uniquePlayers([...starters, ...bench, ...reserve]));
          setFixtures(normalizedFixtures);
          return;
        }

        const normalizedPlayers = Array.isArray(playersData)
          ? playersData
          : playersData?.players ||
            playersData?.team?.players ||
            detailData?.players ||
            [];

        setLineupSlots([]);
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

  const startersFromSlots = mapLineupSlotsToPlayers(lineupSlots);

  const starterCandidates = players.filter(
    (p) => p.role === "starter" || p.lineupSlot || p.lineupPosition
  );

  const starters =
    startersFromSlots.length > 0
      ? startersFromSlots
      : starterCandidates.length > 0
        ? starterCandidates
        : [...players]
            .sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))
            .slice(0, 11);

  const teamOverall = getTeamFitOverall(starters);

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
                      showLineupPosition
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