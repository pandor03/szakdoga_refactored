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

export default function LineupPitch({ slots = [], lineupState = {}, allPlayers = [] }) {
  const getPlayerById = (playerId) => {
    if (!playerId) return null;
    return allPlayers.find((player) => player.id === playerId) || null;
  };

  return (
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

        return (
          <div
            key={slot.slotId}
            className={`pitch-player-card ${
              player ? "filled-player-card" : "empty-player-card"
            }`}
            style={{
              top: position.top,
              left: position.left,
            }}
          >
            <strong>{slot.slotId}</strong>

            <span>{slot.tacticalPosition}</span>

            <small>
              {player
                ? `${player.name} | ${player.position} | ${player.overall}`
                : "Üres"}
            </small>
          </div>
        );
      })}
    </div>
  );
}