const SLOT_POSITIONS = {
  GK: { top: "86%", left: "50%" },

  LB: { top: "68%", left: "18%" },
  CB1: { top: "70%", left: "38%" },
  CB2: { top: "70%", left: "62%" },
  CB3: { top: "70%", left: "50%" },
  RB: { top: "68%", left: "82%" },

  CDM: { top: "55%", left: "50%" },
  CDM1: { top: "55%", left: "38%" },
  CDM2: { top: "55%", left: "62%" },

  CM1: { top: "47%", left: "35%" },
  CM2: { top: "47%", left: "65%" },

  CAM: { top: "34%", left: "50%" },

  LW: { top: "22%", left: "18%" },
  RW: { top: "22%", left: "82%" },

  ST: { top: "15%", left: "50%" },
  ST1: { top: "15%", left: "40%" },
  ST2: { top: "15%", left: "60%" },
};

const MIDFIELD_POSITIONS = ["CM", "CDM", "CAM"];

const getFitClass = (player, slot) => {
  if (!player) return "";

  if (player.position === slot.tacticalPosition) return "fit-good";

  if (
    MIDFIELD_POSITIONS.includes(player.position) &&
    MIDFIELD_POSITIONS.includes(slot.tacticalPosition)
  ) {
    return "fit-ok";
  }

  return "fit-bad";
};

function PlayerTooltip({ player }) {
  if (!player) return null;

  return (
    <div className="player-tooltip">
      <strong>{player.name}</strong>

      <p>
        {player.position} | OVR: {player.overall}
      </p>

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

function MiniPlayerCard({ player }) {
  return (
    <div className="bench-player-card">
      <span className="bench-player-ovr">{player.overall}</span>

      <strong>{player.name}</strong>
      <small>{player.position}</small>

      <PlayerTooltip player={player} />
    </div>
  );
}

function PlayerGroup({ title, players }) {
  return (
    <div className="pitch-player-group">
      <div className="pitch-player-group-header">
        <h3>{title}</h3>
        <span>{players.length}</span>
      </div>

      {players.length ? (
        <div className="bench-card-grid">
          {players.map((player) => (
            <MiniPlayerCard key={player.id} player={player} />
          ))}
        </div>
      ) : (
        <p className="muted-text">Nincs játékos ebben a csoportban.</p>
      )}
    </div>
  );
}

export default function LineupPitch({
  slots = [],
  lineupState = {},
  allPlayers = [],
  benchPlayers = [],
  reservePlayers = [],
  onSlotSwap,
  isUpdating = false,
}) {
  const getPlayerById = (playerId) => {
    if (!playerId) return null;
    return allPlayers.find((player) => player.id === playerId) || null;
  };

  const handleDragStart = (event, sourceSlotId) => {
    event.dataTransfer.setData("text/plain", sourceSlotId);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (event, targetSlotId) => {
    event.preventDefault();

    const sourceSlotId = event.dataTransfer.getData("text/plain");

    if (!sourceSlotId || sourceSlotId === targetSlotId || isUpdating) return;

    onSlotSwap?.(sourceSlotId, targetSlotId);
  };

  return (
    <div className="lineup-pitch-section">
      {isUpdating && (
        <div className="lineup-inline-loading">Felállás frissítése...</div>
      )}

      <div className="lineup-pitch">
        <div className="pitch-line center-line" />
        <div className="pitch-circle" />
        <div className="pitch-box top-box" />
        <div className="pitch-box bottom-box" />

        {slots.map((slot) => {
          const position = SLOT_POSITIONS[slot.slotId] || {
            top: "50%",
            left: "50%",
          };

          const player = getPlayerById(lineupState[slot.slotId]);
          const fitClass = getFitClass(player, slot);

          return (
            <div
              key={slot.slotId}
              className={`pitch-player-card ${
                player ? "filled-player-card" : "empty-player-card"
              }`}
              draggable={Boolean(player) && !isUpdating}
              onDragStart={(event) => handleDragStart(event, slot.slotId)}
              onDragOver={handleDragOver}
              onDrop={(event) => handleDrop(event, slot.slotId)}
              style={{
                top: position.top,
                left: position.left,
              }}
            >
              {player && (
                <span className={`player-ovr ${fitClass}`}>
                  {player.overall}
                </span>
              )}

              <div className="player-card-content">
                <div className="player-name">{player ? player.name : "Üres"}</div>
                <div className="player-slot">{slot.tacticalPosition}</div>
              </div>

              <PlayerTooltip player={player} />
            </div>
          );
        })}
      </div>

      <PlayerGroup title="Cserepad" players={benchPlayers} />
      <PlayerGroup title="Tartalékok" players={reservePlayers} />
    </div>
  );
}