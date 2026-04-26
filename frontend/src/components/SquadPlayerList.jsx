function PlayerTooltip({ player }) {
  return (
    <div className="player-tooltip squad-list-tooltip">
      <strong>{player.name}</strong>

      <p>
        {player.position} | OVR: {player.overall}
      </p>

      <div className="tooltip-stat-row">
        <span>Érték</span>
        <strong>
          {player.marketValue
            ? new Intl.NumberFormat("hu-HU").format(player.marketValue)
            : "-"}
        </strong>
      </div>

      <div className="tooltip-stat-row">
        <span>Pace</span>
        <strong>{player.pace}</strong>
      </div>

      <div className="tooltip-stat-row">
        <span>Shooting</span>
        <strong>{player.shooting}</strong>
      </div>

      <div className="tooltip-stat-row">
        <span>Passing</span>
        <strong>{player.passing}</strong>
      </div>

      <div className="tooltip-stat-row">
        <span>Dribbling</span>
        <strong>{player.dribbling}</strong>
      </div>

      <div className="tooltip-stat-row">
        <span>Defending</span>
        <strong>{player.defending}</strong>
      </div>

      <div className="tooltip-stat-row">
        <span>Physical</span>
        <strong>{player.physical}</strong>
      </div>
    </div>
  );
}

function PlayerCard({ player }) {
  return (
    <div className="squad-list-player-card">
      <span className="squad-list-ovr">{player.overall}</span>

      <div>
        <strong>{player.name}</strong>
        <p className="muted-text">{player.position}</p>
      </div>

      <span className={`role-badge role-${player.role}`}>
        {player.role}
      </span>

      <PlayerTooltip player={player} />
    </div>
  );
}

export default function SquadPlayerList({ players }) {
  const sortedPlayers = [...players].sort((a, b) => {
    if (b.overall !== a.overall) return b.overall - a.overall;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="card squad-player-list-card">
      <h2>Játékoskeret</h2>

      <div className="squad-list-grid">
        {sortedPlayers.map((player) => (
          <PlayerCard key={player.id} player={player} />
        ))}
      </div>
    </div>
  );
}