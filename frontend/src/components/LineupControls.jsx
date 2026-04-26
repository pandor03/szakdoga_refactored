const FORMATION_OPTIONS = [
  "4-3-3",
  "4-2-3-1",
  "4-4-2",
  "4-1-2-1-2",
  "3-5-2",
];

export default function LineupControls({
  currentFormation,
  isUpdating,
  isLineupValid,
  emptySlotCount,
  duplicatePlayerCount,
  onFormationChange,
  onSave,
  onAutoPick,
}) {
  return (
    <div className="card lineup-controls-card">
      <h2>Felállás vezérlés</h2>

      <label>Formáció</label>

      <select
        value={currentFormation}
        disabled={isUpdating}
        onChange={(e) => onFormationChange(e.target.value)}
      >
        {FORMATION_OPTIONS.map((formation) => (
          <option key={formation} value={formation}>
            {formation}
          </option>
        ))}
      </select>

      {!isLineupValid && (
        <div className="error-text">
          {emptySlotCount > 0 && (
            <p>Hiányzó pozíciók száma: {emptySlotCount}</p>
          )}

          {duplicatePlayerCount > 0 && (
            <p>Egy játékos csak egyszer szerepelhet a kezdőben.</p>
          )}
        </div>
      )}

      <div className="button-row lineup-action-row">
        <button onClick={onSave} disabled={isUpdating || !isLineupValid}>
          {isUpdating ? "Mentés..." : "Mentés"}
        </button>

        <button
          className="secondary-btn"
          onClick={onAutoPick}
          disabled={isUpdating}
        >
          Auto pick
        </button>
      </div>
    </div>
  );
}