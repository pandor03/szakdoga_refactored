import { useEffect } from "react";
import GameNav from "../components/GameNav";
import { useGameStore } from "../store/gameStore";
import { useScreenStore } from "../store/screenStore";

const POSITION_OPTIONS = [
  "",
  "GK",
  "LB",
  "CB",
  "RB",
  "CDM",
  "CM",
  "CAM",
  "LW",
  "RW",
  "ST",
];

const ROLE_OPTIONS = [
  { value: "starter", label: "Kezdő" },
  { value: "bench", label: "Pad" },
  { value: "reserve", label: "Tartalék" },
];

const getPlayersFromSquadScreen = (squadScreen) => {
  if (!squadScreen?.lineup) return [];

  const starters =
    squadScreen.lineup.preview
      ?.map((slot) =>
        slot.player
          ? {
              ...slot.player,
              displaySlot: slot.slotId,
              tacticalPosition: slot.tacticalPosition,
            }
          : null
      )
      .filter(Boolean) ?? [];

  const bench = squadScreen.lineup.bench ?? [];
  const reserve = squadScreen.lineup.reserve ?? [];

  const playersById = new Map();

  [...starters, ...bench, ...reserve].forEach((player) => {
    playersById.set(player.id, player);
  });

  return Array.from(playersById.values()).sort((a, b) => {
    if (a.role !== b.role) {
      const roleOrder = { starter: 1, bench: 2, reserve: 3 };
      return (roleOrder[a.role] ?? 99) - (roleOrder[b.role] ?? 99);
    }

    return b.overall - a.overall;
  });
};

export default function SquadPage() {
  const activeSaveId = useGameStore((state) => state.activeSaveId);

  const squadScreen = useScreenStore((state) => state.squadScreen);
  const isLoading = useScreenStore((state) => state.isLoadingSquadScreen);
  const error = useScreenStore((state) => state.squadScreenError);

  const isUpdatingSquadPlayer = useScreenStore(
    (state) => state.isUpdatingSquadPlayer
  );

  const loadSquadScreen = useScreenStore((state) => state.loadSquadScreen);
  const setPlayerRole = useScreenStore((state) => state.setPlayerRole);
  const setPlayerLineupPosition = useScreenStore(
    (state) => state.setPlayerLineupPosition
  );

  useEffect(() => {
    loadSquadScreen(activeSaveId).catch(() => {});
  }, [activeSaveId, loadSquadScreen]);

  const handleRoleChange = async (playerId, role) => {
    await setPlayerRole(activeSaveId, playerId, role).catch(() => {});
  };

  const handlePositionChange = async (playerId, lineupPosition) => {
    await setPlayerLineupPosition(
      activeSaveId,
      playerId,
      lineupPosition
    ).catch(() => {});
  };

  const players = getPlayersFromSquadScreen(squadScreen);

  if (isLoading) {
    return (
      <div className="page-shell">
        <div className="page-container">
          <p>Keret betöltése...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell">
        <div className="page-container">
          <p className="error-text">{error}</p>
          <GameNav />
        </div>
      </div>
    );
  }

  if (!squadScreen) {
    return (
      <div className="page-shell">
        <div className="page-container">
          <p>Nincs keret adat.</p>
          <GameNav />
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="top-row">
          <div>
            <h1>Keret</h1>
            <p className="muted-text">
              {squadScreen.team?.name} ({squadScreen.team?.shortName})
            </p>
          </div>

          <GameNav />
        </div>

        <div className="dashboard-grid">
          <section className="card">
            <h2>Csapat összegzés</h2>
            <p>Keret méret: {squadScreen.squad?.squadSize}</p>
            <p>Kezdők: {squadScreen.squad?.starterCount}</p>
            <p>Pad: {squadScreen.squad?.benchCount}</p>
            <p>Tartalék: {squadScreen.squad?.reserveCount}</p>
            <p>Átlag életkor: {squadScreen.squad?.averageAge}</p>
            <p>Átlag overall: {squadScreen.squad?.averageOverall}</p>
            <p>Piaci érték: {squadScreen.squad?.totalMarketValue}</p>
          </section>

          <section className="card">
            <h2>Overall</h2>
            <p>Teljes csapat: {squadScreen.overall?.lineupOverall}</p>
            <p>Védelem: {squadScreen.overall?.defense}</p>
            <p>Középpálya: {squadScreen.overall?.midfield}</p>
            <p>Támadás: {squadScreen.overall?.attack}</p>
          </section>

          <section className="card">
            <h2>Kezdő előnézet</h2>

            {squadScreen.lineup?.preview?.map((slot) => (
              <div key={slot.slotId} className="table-row">
                <span>
                  {slot.tacticalPosition} -{" "}
                  {slot.player?.name || "Üres pozíció"}
                </span>

                <strong>{slot.player?.effectiveOverall ?? "-"}</strong>
              </div>
            ))}
          </section>

          <section className="card">
            <h2>Keret kezelés</h2>

            {players.length ? (
              players.map((player) => (
                <div key={player.id} className="table-row">
                  <span>
                    {player.name} ({player.position}) | OVR: {player.overall}
                    {player.displaySlot ? ` | Slot: ${player.displaySlot}` : ""}
                  </span>

                  <div className="button-row">
                    <select
                      value={player.role}
                      disabled={isUpdatingSquadPlayer}
                      onChange={(e) =>
                        handleRoleChange(player.id, e.target.value)
                      }
                    >
                      {ROLE_OPTIONS.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={player.lineupPosition ?? ""}
                      disabled={isUpdatingSquadPlayer}
                      onChange={(e) =>
                        handlePositionChange(player.id, e.target.value)
                      }
                    >
                      {POSITION_OPTIONS.map((position) => (
                        <option key={position || "none"} value={position}>
                          {position || "Nincs pozíció"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))
            ) : (
              <p>Nincs játékos a keretben.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}