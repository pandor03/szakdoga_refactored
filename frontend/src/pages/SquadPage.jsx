import { useEffect, useMemo, useState } from "react";
import GameNav from "../components/GameNav";
import { useGameStore } from "../store/gameStore";
import { useScreenStore } from "../store/screenStore";
import LineupPitch from "../components/LineupPitch";
import SquadSummary from "../components/SquadSummary";
import SquadPlayerList from "../components/SquadPlayerList";

const uniquePlayers = (players) => {
  const map = new Map();

  players.filter(Boolean).forEach((player) => {
    map.set(player.id, player);
  });

  return Array.from(map.values());
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
  const [benchState, setBenchState] = useState([]);
  const [reserveState, setReserveState] = useState([]);
  const [isLineupRefreshing, setIsLineupRefreshing] = useState(false);

  useEffect(() => {
    loadSquadScreen(activeSaveId).catch(() => {});
  }, [activeSaveId, loadSquadScreen]);

  const lineupSlots = squadScreen?.lineup?.preview || [];

  const currentFormation =
    squadScreen?.team?.formation || squadScreen?.lineup?.formation || "4-3-3";

  useEffect(() => {
    if (!squadScreen?.lineup?.preview) return;

    const initialLineup = {};

    squadScreen.lineup.preview.forEach((slot) => {
      initialLineup[slot.slotId] = slot.player?.id || "";
    });

    setLineupState(initialLineup);
    setBenchState(squadScreen.lineup.bench || []);
    setReserveState(squadScreen.lineup.reserve || []);
  }, [squadScreen]);

  const starters = useMemo(
    () => lineupSlots.map((slot) => slot.player).filter(Boolean),
    [lineupSlots]
  );

  const allPlayers = useMemo(
    () => uniquePlayers([...starters, ...benchState, ...reserveState]),
    [starters, benchState, reserveState]
  );

  const getPlayerById = (playerId) =>
    allPlayers.find((player) => player.id === playerId) || null;

  const buildSavePayload = (nextLineupState, nextBenchState) => {
    const startersPayload = Object.entries(nextLineupState)
      .filter(([, playerId]) => playerId)
      .map(([lineupSlot, playerId]) => ({
        playerId,
        lineupSlot,
      }));

    if (startersPayload.length !== lineupSlots.length) return null;

    return {
      formation: currentFormation,
      starters: startersPayload,
      benchPlayerIds: nextBenchState.map((player) => player.id),
    };
  };

  const persistLineup = async (nextLineupState, nextBenchState) => {
    const payload = buildSavePayload(nextLineupState, nextBenchState);

    if (!payload) return;

    setIsLineupRefreshing(true);

    try {
      await saveLineup(activeSaveId, payload);
    } finally {
      setIsLineupRefreshing(false);
    }
  };

  const getDraggedPlayerId = (source) => {
    if (source.type === "slot") return lineupState[source.id] || "";
    return source.playerId || "";
  };

  const getTargetPlayerId = (target) => {
    if (target.type === "slot") return lineupState[target.id] || "";
    return target.playerId || "";
  };

  const removeFromGroup = (players, playerId) =>
    players.filter((player) => player.id !== playerId);

  const replaceInGroup = (players, targetPlayerId, replacementPlayer) =>
    players.map((player) =>
      player.id === targetPlayerId ? replacementPlayer : player
    );

  const handlePlayerMove = async (source, target) => {
    const sourcePlayerId = getDraggedPlayerId(source);
    const targetPlayerId = getTargetPlayerId(target);

    if (!sourcePlayerId) return;

    const sourcePlayer = getPlayerById(sourcePlayerId);
    const targetPlayer = getPlayerById(targetPlayerId);

    if (!sourcePlayer) return;

    const nextLineupState = { ...lineupState };
    let nextBenchState = [...benchState];
    let nextReserveState = [...reserveState];

    const removeSource = () => {
      if (source.type === "slot") {
        nextLineupState[source.id] = "";
      }

      if (source.type === "bench") {
        nextBenchState = removeFromGroup(nextBenchState, sourcePlayerId);
      }

      if (source.type === "reserve") {
        nextReserveState = removeFromGroup(nextReserveState, sourcePlayerId);
      }
    };

    const putTargetPlayerBackToSourcePlace = () => {
      if (!targetPlayer) return;

      if (source.type === "slot") {
        nextLineupState[source.id] = targetPlayer.id;
      }

      if (source.type === "bench") {
        nextBenchState.push(targetPlayer);
      }

      if (source.type === "reserve") {
        nextReserveState.push(targetPlayer);
      }
    };

    if (target.type === "slot") {
      if (source.type === "slot") {
        nextLineupState[source.id] = targetPlayerId || "";
        nextLineupState[target.id] = sourcePlayerId;
      } else {
        removeSource();
        nextLineupState[target.id] = sourcePlayerId;

        if (targetPlayer) {
          if (source.type === "bench") {
            nextBenchState.push(targetPlayer);
          }

          if (source.type === "reserve") {
            nextReserveState.push(targetPlayer);
          }
        }
      }
    }

    if (target.type === "bench") {
      if (source.type === "bench" && source.playerId === target.playerId) return;

      removeSource();

      if (targetPlayer) {
        nextBenchState = replaceInGroup(
          nextBenchState,
          targetPlayer.id,
          sourcePlayer
        );

        putTargetPlayerBackToSourcePlace();
      } else {
        nextBenchState.push(sourcePlayer);
      }
    }

    if (target.type === "reserve") {
      if (source.type === "reserve" && source.playerId === target.playerId) {
        return;
      }

      removeSource();

      if (targetPlayer) {
        nextReserveState = replaceInGroup(
          nextReserveState,
          targetPlayer.id,
          sourcePlayer
        );

        putTargetPlayerBackToSourcePlace();
      } else {
        nextReserveState.push(sourcePlayer);
      }
    }

    setLineupState(nextLineupState);
    setBenchState(nextBenchState);
    setReserveState(nextReserveState);

    await persistLineup(nextLineupState, nextBenchState);
  };

  const handleAutoPick = async () => {
    setIsLineupRefreshing(true);

    try {
      await autoPickLineup(activeSaveId);
    } finally {
      setIsLineupRefreshing(false);
    }
  };

  const handleFormationChange = async (formation) => {
    if (formation === currentFormation) return;

    setIsLineupRefreshing(true);

    try {
      await changeFormation(activeSaveId, formation);
    } finally {
      setIsLineupRefreshing(false);
    }
  };

  if (isLoading && !squadScreen) {
    return <p>Keret betöltése...</p>;
  }

  if (error && !squadScreen) {
    return <p>{error}</p>;
  }

  if (!squadScreen) {
    return <p>Nincs adat</p>;
  }

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="squad-hero">
          <div>
            <span className="squad-hero-kicker">Squad Management</span>
            <h1>{squadScreen.team?.name}</h1>
            <p>
              {squadScreen.team?.shortName} | {currentFormation} | Keret méret:{" "}
              {squadScreen.squad?.squadSize}
            </p>
            <p className="muted-text">
              Budget: €{Number(squadScreen?.team?.budget || 0).toLocaleString()}
            </p>
          </div>

          <GameNav />
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="card squad-workspace-card">
          <div className="squad-workspace-header">
            <div>
              <h2>Kezdőcsapat</h2>
              <p className="muted-text">
                Húzd át a játékosokat kezdő, cserepad és tartalék között.
              </p>
            </div>

            <SquadSummary
              squadScreen={squadScreen}
              currentFormation={currentFormation}
              isUpdating={isLineupRefreshing || isUpdating}
              onFormationChange={handleFormationChange}
              onAutoPick={handleAutoPick}
            />

            <select
              value={squadScreen?.team?.tacticStyle || "balanced"}
              onChange={(event) =>
                changeTacticStyle(activeSaveId, event.target.value)
              }
            >
              <option value="balanced">Balanced</option>
              <option value="attacking">Attacking</option>
              <option value="defensive">Defensive</option>
            </select>
          </div>

          <LineupPitch
            slots={lineupSlots}
            lineupState={lineupState}
            allPlayers={allPlayers}
            benchPlayers={benchState}
            reservePlayers={reserveState}
            onPlayerMove={handlePlayerMove}
            isUpdating={isLineupRefreshing || isUpdating}
          />
        </div>

        <SquadPlayerList players={allPlayers} />
      </div>
    </div>
  );
}