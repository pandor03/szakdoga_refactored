import { useEffect, useState } from "react";
import GameNav from "../components/GameNav";
import { useGameStore } from "../store/gameStore";
import { useScreenStore } from "../store/screenStore";
import LineupPitch from "../components/LineupPitch";

const SLOT_COMPATIBILITY = {
  GK: ["GK"],
  LB: ["LB", "RB", "CB", "CDM", "CM", "LW"],
  CB: ["CB", "LB", "RB", "CDM", "CM"],
  RB: ["RB", "LB", "CB", "CDM", "CM", "RW"],
  CDM: ["CDM", "CM", "CB", "CAM", "LB", "RB"],
  CM: ["CM", "CDM", "CAM", "LW", "RW", "ST"],
  CAM: ["CAM", "CM", "ST", "LW", "RW", "CDM"],
  LW: ["LW", "RW", "CAM", "ST", "CM"],
  RW: ["RW", "LW", "CAM", "ST", "CM"],
  ST: ["ST", "CAM", "LW", "RW", "CM"],
};

const FORMATION_OPTIONS = [
  "4-3-3",
  "4-2-3-1",
  "4-4-2",
  "4-1-2-1-2",
  "3-5-2",
];

const getFilteredPlayersForSlot = (allPlayers, slot, lineupState) => {
  const allowedPositions = SLOT_COMPATIBILITY[slot.tacticalPosition] || [];

  const selectedPlayerIds = Object.entries(lineupState)
    .filter(([slotId]) => slotId !== slot.slotId)
    .map(([, playerId]) => playerId)
    .filter(Boolean);

  return allPlayers.filter((player) => {
    const isCompatible = allowedPositions.includes(player.position);
    const isAlreadySelected = selectedPlayerIds.includes(player.id);

    return isCompatible && !isAlreadySelected;
  });
};

export default function SquadPage() {
  const activeSaveId = useGameStore((state) => state.activeSaveId);

  const squadScreen = useScreenStore((state) => state.squadScreen);
  const isLoading = useScreenStore((state) => state.isLoadingSquadScreen);
  const error = useScreenStore((state) => state.squadScreenError);

  const loadSquadScreen = useScreenStore((state) => state.loadSquadScreen);
  const saveLineup = useScreenStore((state) => state.saveLineup);
  const autoPickLineup = useScreenStore((state) => state.autoPickLineup);
  const changeFormation = useScreenStore((state) => state.changeFormation);

  const isUpdating = useScreenStore((state) => state.isUpdatingSquadPlayer);

  const [lineupState, setLineupState] = useState({});

  useEffect(() => {
    loadSquadScreen(activeSaveId).catch(() => {});
  }, [activeSaveId, loadSquadScreen]);

  useEffect(() => {
    if (!squadScreen?.lineup?.preview) return;

    const initial = {};

    lineupSlots.forEach((slot) => {
      initial[slot.slotId] = slot.player?.id || "";
    });

    setLineupState(initial);
  }, [squadScreen]);

  const players =
    squadScreen?.lineup?.bench?.concat(squadScreen?.lineup?.reserve || []) ||
    [];

  const starters =
    squadScreen?.lineup?.preview
      ?.map((slot) => slot.player)
      .filter(Boolean) || [];

  const allPlayers = [...starters, ...players];

  const lineupSlots = squadScreen?.lineup?.preview || [];

  const currentFormation =
    squadScreen?.team?.formation || squadScreen?.lineup?.formation || "4-3-3";

  const selectedPlayerIds = Object.values(lineupState).filter(Boolean);

  const emptySlotCount = lineupSlots.filter(
    (slot) => !lineupState[slot.slotId]
  ).length;

  const duplicatePlayerCount =
    selectedPlayerIds.length - new Set(selectedPlayerIds).size;

  const isLineupValid =
    emptySlotCount === 0 &&
    selectedPlayerIds.length === lineupSlots.length &&
    duplicatePlayerCount === 0;

  const handleChange = (slotId, playerId) => {
    setLineupState((prev) => ({
      ...prev,
      [slotId]: playerId,
    }));
  };

  const handleSave = async () => {
    const starters = Object.entries(lineupState)
      .filter(([, playerId]) => playerId)
      .map(([lineupSlot, playerId]) => ({
        playerId,
        lineupSlot,
      }));

    const starterIds = starters.map((starter) => starter.playerId);

    const benchPlayerIds =
      squadScreen?.lineup?.bench
        ?.map((player) => player.id)
        .filter((id) => !starterIds.includes(id)) || [];

    const payload = {
      formation: currentFormation,
      starters,
      benchPlayerIds,
    };

    await saveLineup(activeSaveId, payload).catch(() => {});
  };

  const handleAutoPick = async () => {
    await autoPickLineup(activeSaveId).catch(() => {});
  };

  const handleFormationChange = async (formation) => {
    await changeFormation(activeSaveId, formation).catch(() => {});
  };

  if (isLoading) {
    return <p>Keret betöltése...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!squadScreen) {
    return <p>Nincs adat</p>;
  }

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="top-row">
          <div>
            <h1>Keret</h1>
            <p>
              {squadScreen.team?.name} ({squadScreen.team?.shortName})
            </p>
          </div>

          <GameNav />
        </div>

        <div className="card">
          <h2>Kezdő (Formation alapú)</h2>

          <div className="table-row">
            <span>Formáció</span>

            <select
              value={currentFormation}
              disabled={isUpdating}
              onChange={(e) => handleFormationChange(e.target.value)}
            >
              {FORMATION_OPTIONS.map((formation) => (
                <option key={formation} value={formation}>
                  {formation}
                </option>
              ))}
            </select>
          </div>

          <LineupPitch
            slots={lineupSlots}
            lineupState={lineupState}
            allPlayers={allPlayers}
          />

          {lineupSlots.map((slot) => (
            <div key={slot.slotId} className="table-row">
              <span>
                {slot.slotId} - {slot.tacticalPosition}
              </span>

              <select
                value={lineupState[slot.slotId] || ""}
                disabled={isUpdating}
                onChange={(e) => handleChange(slot.slotId, e.target.value)}
              >
                <option value="">-- üres --</option>

                {getFilteredPlayersForSlot(allPlayers, slot, lineupState).map(
                  (player) => (
                    <option key={player.id} value={player.id}>
                      {player.name} ({player.position}) | OVR: {player.overall}
                    </option>
                  )
                )}
              </select>
            </div>
          ))}

          {!isLineupValid && (
            <div className="error-text" style={{ marginTop: "10px" }}>
              {emptySlotCount > 0 && (
                <p>Hiányzó pozíciók száma: {emptySlotCount}</p>
              )}

              {duplicatePlayerCount > 0 && (
                <p>Egy játékos csak egyszer szerepelhet a kezdőben.</p>
              )}
            </div>
          )}

          <div style={{ marginTop: "10px" }}>
            <button onClick={handleSave} disabled={isUpdating || !isLineupValid}>
              Mentés
            </button>

            <button
              onClick={handleAutoPick}
              disabled={isUpdating}
              style={{ marginLeft: "10px" }}
            >
              Auto pick
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}