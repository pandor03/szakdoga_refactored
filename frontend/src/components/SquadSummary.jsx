const FORMATION_OPTIONS = [
  "4-3-3",
  "4-2-3-1",
  "4-4-2",
  "4-1-2-1-2",
  "3-5-2",
];

export default function SquadSummary({
  squadScreen,
  currentFormation,
  isUpdating,
  onFormationChange,
  onAutoPick,
}) {
  return (
    <div className="card squad-summary-card">
      <h2>Csapat összegzés</h2>

      <div className="summary-stat-row">
        <span>Keret méret</span>
        <strong>{squadScreen.squad?.squadSize}</strong>
      </div>

      <div className="summary-stat-row">
        <span>Átlag overall</span>
        <strong>{squadScreen.squad?.averageOverall}</strong>
      </div>

      <div className="summary-stat-row">
        <span>Piaci érték</span>
        <strong>{squadScreen.squad?.totalMarketValue}</strong>
      </div>

      <div className="summary-divider" />

      <h3>Felállás vezérlés</h3>

      <label>Formáció</label>

      <select
        value={currentFormation}
        disabled={isUpdating}
        onChange={(event) => onFormationChange(event.target.value)}
      >
        {FORMATION_OPTIONS.map((formation) => (
          <option key={formation} value={formation}>
            {formation}
          </option>
        ))}
      </select>

      <button
        className="secondary-btn full-width-btn"
        onClick={onAutoPick}
        disabled={isUpdating}
      >
        {isUpdating ? "Frissítés..." : "Auto pick"}
      </button>
    </div>
  );
}