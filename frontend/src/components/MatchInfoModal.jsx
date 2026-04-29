import { useEffect, useState } from "react";
import { getTeamPlayers } from "../api/screenApi";
import InlineLoader from "./InlineLoader";
import EmptyState from "./EmptyState";
import MatchCard from "./MatchCard";

const normalizePosition = (value) => {
  if (!value) return "";

  return String(value)
    .toUpperCase()
    .replace(/[0-9]/g, "")
    .replace("_", "")
    .trim();
};

const getTargetPosition = (player) =>
  player.playedPosition ||
  player.tacticalPosition ||
  player.position;

const MIDFIELD_POSITIONS = ["CM", "CDM", "CAM"];

const getFitData = (player) => {
  const playerPosition = normalizePosition(player.position);
  const targetPosition = normalizePosition(getTargetPosition(player));

  if (!playerPosition || !targetPosition) {
    return { multiplier: 1, className: "fit-good" };
  }

  if (playerPosition === targetPosition) {
    return { multiplier: 1, className: "fit-good" };
  }

  if (
    MIDFIELD_POSITIONS.includes(playerPosition) &&
    MIDFIELD_POSITIONS.includes(targetPosition)
  ) {
    return { multiplier: 0.9, className: "fit-ok" };
  }

  return { multiplier: 0.75, className: "fit-bad" };
};

const getRawOverall = (player) =>
  player.overall ?? player.rating ?? player.ovr ?? player.stats?.overall ?? "-";

const getPlayerOverall = (player) => {
  const rawOverall = Number(getRawOverall(player));

  if (Number.isNaN(rawOverall)) {
    return "-";
  }

  return Math.round(rawOverall * getFitData(player).multiplier);
};

const getTeamOverall = (players) => {
  const values = players
    .slice(0, 11)
    .map((player) => Number(getPlayerOverall(player)))
    .filter((value) => !Number.isNaN(value));

  if (!values.length) return "-";

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
};

const getPlayerSubstitutionStatus = (player, substitutions = []) => {
  const subOut = substitutions.find(
    (event) => event.playerOut?.id === player.id
  );

  if (subOut) {
    return {
      type: "out",
      text: `Lecserélve ${subOut.minute}'`,
    };
  }

  const subIn = substitutions.find(
    (event) => event.playerIn?.id === player.id
  );

  if (subIn) {
    return {
      type: "in",
      text: `Beállt ${subIn.minute}'`,
    };
  }

  return null;
};

function PlayerStatsTooltip({ player }) {
  return (
    <div className="player-tooltip">
      <strong>{player.name}</strong>

      <p>
        Saját poszt: {player.position || "-"} | Játszott poszt:{" "}
        {getTargetPosition(player) || "-"}
      </p>

      <p>
        OVR: {getRawOverall(player)} | Fit OVR: {getPlayerOverall(player)}
      </p>

      {player.stamina !== undefined && (
        <div className="tooltip-stat-row">
          <span>Stamina</span>
          <strong>{player.stamina}</strong>
        </div>
      )}

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

function PlayerInfoRow({ player, substitutions = [] }) {
  const fit = getFitData(player);
  const substitutionStatus = getPlayerSubstitutionStatus(player, substitutions);

  return (
    <div className="match-team-squad-row player-info-hover-row">
      <strong>
        {player.name}
        {substitutionStatus && (
          <small className={`substitution-badge substitution-${substitutionStatus.type}`}>
            {substitutionStatus.text}
          </small>
        )}
      </strong>

      <span>{player.position || "-"}</span>
      <em className={fit.className}>{getPlayerOverall(player)}</em>

      <PlayerStatsTooltip player={player} />
    </div>
  );
}

function TeamCurrentSquadPreview({ saveId, team, onTeamClick }) {
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!saveId || !team?.id) return;

    setIsLoading(true);

    getTeamPlayers(saveId, team.id)
      .then((data) => {
        console.log("MATCH INFO team players response:", team?.shortName, data);
        console.table(
          (data?.players || []).map((p) => ({
            name: p.name,
            position: p.position,
            lineupPosition: p.lineupPosition,
            tacticalPosition: p.tacticalPosition,
            playedPosition: p.playedPosition,
            lineupSlot: p.lineupSlot,
            effectiveOverall: p.effectiveOverall,
            overall: p.overall,
          }))
        );
        const normalizedPlayers = Array.isArray(data)
          ? data
          : data?.players || data?.team?.players || data?.data || [];

        setPlayers(normalizedPlayers);
      })
      .catch(() => setPlayers([]))
      .finally(() => setIsLoading(false));
  }, [saveId, team?.id]);

  const starters =
    players.filter(
      (p) => p.role === "starter" || p.lineupSlot || p.lineupPosition
    ).length > 0
      ? players.filter(
          (p) => p.role === "starter" || p.lineupSlot || p.lineupPosition
        )
      : [...players].sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0)).slice(0, 11);

  const bench = players.filter((p) => p.role === "bench");

  return (
    <TeamSnapshotPreview
      team={team}
      formation={team?.formation}
      lineup={starters}
      bench={bench}
      onTeamClick={onTeamClick}
      isLoading={isLoading}
      loadingText="Keret betöltése..."
      emptyText="Nincs keret adat."
    />
  );
}

function TeamSnapshotPreview({
  team,
  formation,
  lineup,
  bench,
  substitutions = [],
  onTeamClick,
  isLoading = false,
  loadingText = "Keret betöltése...",
  emptyText = "Nincs keret adat.",
}) {
  const teamOverall = getTeamOverall(lineup || []);

  return (
    <section className="match-team-squad-preview">
      <h3 className="clickable-team" onClick={() => onTeamClick?.(team?.id)}>
        {team?.name} <span>({team?.shortName})</span>
        <strong className="match-team-overall">OVR {teamOverall}</strong>
      </h3>

      <p className="muted-text">Formáció: {formation || "-"}</p>

      {isLoading ? (
        <InlineLoader text={loadingText} />
      ) : lineup?.length ? (
        <>
          <h4>Kezdő</h4>
          <div className="match-team-squad-list">
            {lineup.slice(0, 11).map((player) => (
              <PlayerInfoRow
                key={player.id}
                player={player}
                substitutions={substitutions}
              />
            ))}
          </div>

          <h4>Cserepad</h4>
          {bench?.length ? (
            <div className="match-team-squad-list match-team-bench-list">
              {bench.map((player) => (
                <PlayerInfoRow
                  key={player.id}
                  player={player}
                  substitutions={substitutions}
                />
              ))}
            </div>
          ) : (
            <p className="muted-text">Nem volt cserepad adat.</p>
          )}
        </>
      ) : (
        <EmptyState title={emptyText} />
      )}
    </section>
  );
}

function MatchEvents({ matchSummary }) {
  const goalscorers = matchSummary?.goalscorers || [];
  const substitutions = matchSummary?.substitutions || [];

  return (
    <div className="match-summary-details">
      <h3>Gólszerzők</h3>

      {goalscorers.length ? (
        <div className="match-event-list">
          {goalscorers.map((event, index) => (
            <div key={`${event.minute}-${event.player?.id}-${index}`}>
              {event.minute}' - {event.player?.name} ({event.teamSide})
            </div>
          ))}
        </div>
      ) : (
        <p className="muted-text">Nem volt gólszerző.</p>
      )}

      <h3>Cserék</h3>

      {substitutions.length ? (
        <div className="match-event-list">
          {substitutions.map((event, index) => (
            <div key={`${event.minute}-${event.playerIn?.id}-${index}`}>
              {event.minute}' - {event.playerOut?.name} →{" "}
              {event.playerIn?.name} ({event.teamSide})
            </div>
          ))}
        </div>
      ) : (
        <p className="muted-text">Nem volt csere.</p>
      )}
    </div>
  );
}

export default function MatchInfoModal({ fixture, saveId, onClose, onTeamClick }) {
  if (!fixture) return null;

  const matchSummary = fixture.matchSummary;
  const hasSnapshot = fixture.isPlayed && matchSummary;

  const homeSubstitutions =
    matchSummary?.substitutions?.filter((event) => event.teamSide === "home") || [];

  const awaySubstitutions =
    matchSummary?.substitutions?.filter((event) => event.teamSide === "away") || [];

  return (
    <div className="modal-backdrop">
      <div className="match-info-modal match-info-modal-wide">
        <button className="modal-close-btn" onClick={onClose}>
          ×
        </button>

        <span className="game-page-kicker">
          {fixture.isPlayed ? "Match Summary" : "Match Preview"}
        </span>

        <h2>
          {fixture.homeTeam?.shortName} - {fixture.awayTeam?.shortName}
        </h2>

        <MatchCard fixture={fixture} />

        {hasSnapshot && <MatchEvents matchSummary={matchSummary} />}

        <div className="match-squad-preview-grid">
          {hasSnapshot ? (
            <>
              <TeamSnapshotPreview
                team={fixture.homeTeam}
                formation={matchSummary.homeFormation}
                lineup={matchSummary.homeLineup || []}
                bench={matchSummary.homeBench || []}
                substitutions={homeSubstitutions}
                onTeamClick={onTeamClick}
              />

              <TeamSnapshotPreview
              team={fixture.awayTeam}
              formation={matchSummary.awayFormation}
              lineup={matchSummary.awayLineup || []}
              bench={matchSummary.awayBench || []}
              substitutions={awaySubstitutions}
              onTeamClick={onTeamClick}
            />
            </>
          ) : (
            <>
              <TeamCurrentSquadPreview
                saveId={saveId}
                team={fixture.homeTeam}
                onTeamClick={onTeamClick}
              />

              <TeamCurrentSquadPreview
                saveId={saveId}
                team={fixture.awayTeam}
                onTeamClick={onTeamClick}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}