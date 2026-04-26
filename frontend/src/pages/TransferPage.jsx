import { useEffect } from "react";
import GameNav from "../components/GameNav";
import { useGameStore } from "../store/gameStore";
import { useScreenStore } from "../store/screenStore";

const getMyPlayersFromSquadScreen = (squadScreen) => {
  if (!squadScreen?.lineup) return [];

  const starters =
    squadScreen.lineup.preview
      ?.map((slot) => slot.player)
      .filter(Boolean) ?? [];

  const bench = squadScreen.lineup.bench ?? [];
  const reserve = squadScreen.lineup.reserve ?? [];

  const playersById = new Map();

  [...starters, ...bench, ...reserve].forEach((player) => {
    playersById.set(player.id, player);
  });

  return Array.from(playersById.values());
};

export default function TransferPage() {
  const activeSaveId = useGameStore((state) => state.activeSaveId);

  const transferScreen = useScreenStore((state) => state.transferScreen);
  const squadScreen = useScreenStore((state) => state.squadScreen);

  const isLoadingTransfer = useScreenStore(
    (state) => state.isLoadingTransferScreen
  );
  const isLoadingSquad = useScreenStore((state) => state.isLoadingSquadScreen);

  const error = useScreenStore((state) => state.transferScreenError);

  const isBuyingPlayer = useScreenStore((state) => state.isBuyingPlayer);
  const isUpdatingTransferStatus = useScreenStore(
    (state) => state.isUpdatingTransferStatus
  );

  const loadTransferScreen = useScreenStore(
    (state) => state.loadTransferScreen
  );
  const loadSquadScreen = useScreenStore((state) => state.loadSquadScreen);

  const buyPlayer = useScreenStore((state) => state.buyPlayer);
  const setPlayerTransferStatus = useScreenStore(
    (state) => state.setPlayerTransferStatus
  );

  useEffect(() => {
    if (!activeSaveId) return;

    loadTransferScreen(activeSaveId).catch(() => {});
    loadSquadScreen(activeSaveId).catch(() => {});
  }, [activeSaveId, loadTransferScreen, loadSquadScreen]);

  const handleBuy = async (playerId) => {
    await buyPlayer(activeSaveId, playerId).catch(() => {});
  };

  const handleList = async (playerId) => {
    await setPlayerTransferStatus(activeSaveId, playerId, true).catch(() => {});
  };

  const handleUnlist = async (playerId) => {
    await setPlayerTransferStatus(activeSaveId, playerId, false).catch(() => {});
  };

  const isLoading = isLoadingTransfer || isLoadingSquad;
  const isActionRunning = isBuyingPlayer || isUpdatingTransferStatus;

  const myPlayers = getMyPlayersFromSquadScreen(squadScreen);
  const marketPlayers = transferScreen?.market?.players ?? [];
  const myListedPlayers = transferScreen?.myTransferListedPlayers?.players ?? [];
  const recentTransfers = transferScreen?.recentTransferHistory ?? [];

  if (isLoading) {
    return (
      <div className="page-shell">
        <div className="page-container">
          <p>Átigazolások betöltése...</p>
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

  if (!transferScreen) {
    return (
      <div className="page-shell">
        <div className="page-container">
          <p>Nincs átigazolási adat.</p>
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
            <h1>Átigazolások</h1>
            <p className="muted-text">
              {transferScreen.team?.name} ({transferScreen.team?.shortName})
            </p>
          </div>

          <GameNav />
        </div>

        <div className="dashboard-grid">
          <section className="card">
            <h2>Saját keret listázása</h2>

            {myPlayers.length ? (
              myPlayers.map((player) => (
                <div key={player.id} className="table-row">
                  <span>
                    {player.name} ({player.position}) | OVR: {player.overall} |
                    Érték: {player.marketValue}
                  </span>

                  {player.isTransferListed ? (
                    <button
                      className="danger-btn"
                      disabled={isActionRunning}
                      onClick={() => handleUnlist(player.id)}
                    >
                      {isUpdatingTransferStatus
                        ? "Módosítás..."
                        : "Levétel a piacról"}
                    </button>
                  ) : (
                    <button
                      disabled={isActionRunning}
                      onClick={() => handleList(player.id)}
                    >
                      {isUpdatingTransferStatus
                        ? "Módosítás..."
                        : "Piacra tesz"}
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p>Nincs betöltött saját játékos.</p>
            )}
          </section>

          <section className="card">
            <h2>Piacon lévő játékosok</h2>

            {marketPlayers.length ? (
              marketPlayers.map((player) => (
                <div key={player.id} className="table-row">
                  <span>
                    {player.name} ({player.position}) - {player.team?.shortName}
                    {" | "}OVR: {player.overall}
                    {" | "}Érték: {player.marketValue}
                  </span>

                  <button
                    disabled={isActionRunning}
                    onClick={() => handleBuy(player.id)}
                  >
                    {isBuyingPlayer ? "Vásárlás..." : "Megvesz"}
                  </button>
                </div>
              ))
            ) : (
              <p>
                Nincs elérhető játékos a piacon. Ez akkor normális, ha még más
                csapatból senki nincs transfer listán.
              </p>
            )}
          </section>

          <section className="card">
            <h2>Saját listázott játékosok</h2>

            {myListedPlayers.length ? (
              myListedPlayers.map((player) => (
                <div key={player.id} className="table-row">
                  <span>
                    {player.name} ({player.position})
                  </span>

                  <strong>{player.marketValue}</strong>
                </div>
              ))
            ) : (
              <p>Nincs saját listázott játékos.</p>
            )}
          </section>

          <section className="card">
            <h2>Legutóbbi átigazolások</h2>

            {recentTransfers.length ? (
              recentTransfers.map((item) => (
                <div key={item.id} className="table-row">
                  <span>
                    {item.player?.name} - {item.type}
                  </span>

                  <strong>{item.marketValue}</strong>
                </div>
              ))
            ) : (
              <p>Még nincs átigazolási előzmény.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}