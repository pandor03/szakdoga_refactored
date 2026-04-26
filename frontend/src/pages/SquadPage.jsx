import { useEffect, useState } from "react";
import GameNav from "../components/GameNav";
import { useGameStore } from "../store/gameStore";
import { useScreenStore } from "../store/screenStore";
import LineupPitch from "../components/LineupPitch";
import SquadSummary from "../components/SquadSummary";
import SquadPlayerList from "../components/SquadPlayerList";

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

  const lineupSlots = squadScreen?.lineup?.preview || [];
  const benchPlayers = squadScreen?.lineup?.bench || [];
  const reservePlayers = squadScreen?.lineup?.reserve || [];

  const starters =
    lineupSlots.map((slot) => slot.player).filter(Boolean) || [];

  const allPlayers = [...starters, ...benchPlayers, ...reservePlayers];

  const currentFormation =
    squadScreen?.team?.formation || squadScreen?.lineup?.formation || "4-3-3";

  useEffect(() => {
    if (!lineupSlots.length) return;

    const initial = {};

    lineupSlots.forEach((slot) => {
      initial[slot.slotId] = slot.player?.id || "";
    });

    setLineupState(initial);
  }, [squadScreen]);

  const persistLineup = async (nextLineupState) => {
    const startersPayload = Object.entries(nextLineupState)
      .filter(([, playerId]) => playerId)
      .map(([lineupSlot, playerId]) => ({
        playerId,
        lineupSlot,
      }));

    if (startersPayload.length !== lineupSlots.length) {
      return;
    }

    const starterIds = startersPayload.map((starter) => starter.playerId);

    const benchPlayerIds = benchPlayers
      .map((player) => player.id)
      .filter((id) => !starterIds.includes(id));

    const payload = {
      formation: currentFormation,
      starters: startersPayload,
      benchPlayerIds,
    };

    await saveLineup(activeSaveId, payload).catch(() => {});
  };

  const handleSlotSwap = async (sourceSlotId, targetSlotId) => {
    const nextLineupState = {
      ...lineupState,
      [sourceSlotId]: lineupState[targetSlotId] || "",
      [targetSlotId]: lineupState[sourceSlotId] || "",
    };

    setLineupState(nextLineupState);

    await persistLineup(nextLineupState);
  };

  const handleAutoPick = async () => {
    await autoPickLineup(activeSaveId).catch(() => {});
  };

  const handleFormationChange = async (formation) => {
    if (formation === currentFormation) return;

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

        <div className="squad-layout">
          <div className="squad-main-column">
            <div className="card">
              <h2>Kezdőcsapat</h2>

              <LineupPitch
                slots={lineupSlots}
                lineupState={lineupState}
                allPlayers={allPlayers}
                benchPlayers={benchPlayers}
                reservePlayers={reservePlayers}
                onSlotSwap={handleSlotSwap}
                isUpdating={isUpdating}
              />
            </div>
          </div>

          <div className="squad-side-column">
            <SquadSummary
              squadScreen={squadScreen}
              currentFormation={currentFormation}
              isUpdating={isUpdating}
              onFormationChange={handleFormationChange}
              onAutoPick={handleAutoPick}
            />
          </div>
        </div>

        <SquadPlayerList players={allPlayers} />
      </div>
    </div>
  );
}