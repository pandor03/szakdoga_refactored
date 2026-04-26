const groupPlayersByRole = (players) => ({
  starters: players.filter((player) => player.role === "starter"),
  bench: players.filter((player) => player.role === "bench"),
  reserve: players.filter((player) => player.role === "reserve"),
});

function PlayerRow({ player }) {
  return (
    <div className="squad-player-row">
      <div>
        <strong>{player.name}</strong>
        <p className="muted-text">
          {player.position} | OVR: {player.overall}
        </p>
      </div>

      <span className={`role-badge role-${player.role}`}>
        {player.role}
      </span>
    </div>
  );
}

export default function SquadPlayerList({ players }) {
  const grouped = groupPlayersByRole(players);

  return (
    <div className="card squad-player-list-card">
      <h2>Játékoskeret</h2>

      <h3>Kezdők</h3>
      {grouped.starters.map((player) => (
        <PlayerRow key={player.id} player={player} />
      ))}

      <h3>Pad</h3>
      {grouped.bench.map((player) => (
        <PlayerRow key={player.id} player={player} />
      ))}

      <h3>Tartalék</h3>
      {grouped.reserve.map((player) => (
        <PlayerRow key={player.id} player={player} />
      ))}
    </div>
  );
}