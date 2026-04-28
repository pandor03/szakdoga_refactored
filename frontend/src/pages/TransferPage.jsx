import { useEffect, useMemo, useState } from "react";
import GameNav from "../components/GameNav";
import PageHero from "../components/PageHero";
import EmptyState from "../components/EmptyState";
import InlineLoader from "../components/InlineLoader";
import { useGameStore } from "../store/gameStore";
import { useScreenStore } from "../store/screenStore";

const getMyPlayersFromSquadScreen = (squadScreen) => {
  if (!squadScreen?.lineup) return [];

  const starters =
    squadScreen.lineup.preview?.map((slot) => slot.player).filter(Boolean) ??
    [];

  const bench = squadScreen.lineup.bench ?? [];
  const reserve = squadScreen.lineup.reserve ?? [];

  const playersById = new Map();

  [...starters, ...bench, ...reserve].forEach((player) => {
    playersById.set(player.id, player);
  });

  return Array.from(playersById.values());
};

const formatValue = (value) => {
  if (!value) return "-";
  return new Intl.NumberFormat("hu-HU").format(value);
};

function PlayerTooltip({ player }) {
  return (
    <div className="player-tooltip squad-list-tooltip">
      <strong>{player.name}</strong>

      <p>
        {player.position} | OVR: {player.overall}
      </p>

      <div className="tooltip-stat-row">
        <span>Érték</span>
        <strong>{formatValue(player.marketValue)}</strong>
      </div>

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

function TransferPlayerCard({
  player,
  actionLabel,
  actionClassName,
  disabled,
  onAction,
  meta,
}) {
  return (
    <div className="transfer-player-card">
      <span className="transfer-player-ovr">{player.overall}</span>

      <div className="transfer-player-main">
        <strong>{player.name}</strong>
        <p className="muted-text">
          {player.position}
          {meta ? ` | ${meta}` : ""}
        </p>
      </div>

      <div className="transfer-player-value">
        Érték: <strong>{formatValue(player.marketValue)}</strong>
      </div>

      <button
        className={actionClassName}
        disabled={disabled}
        onClick={() => onAction(player.id)}
      >
        {actionLabel}
      </button>

      <PlayerTooltip player={player} />
    </div>
  );
}

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

  const [filters, setFilters] = useState({
    search: "",
    position: "ALL",
  });

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

  const positionOptions = useMemo(() => {
    const positions = new Set();

    [...myPlayers, ...marketPlayers].forEach((player) => {
      if (player.position) positions.add(player.position);
    });

    return ["ALL", ...Array.from(positions).sort()];
  }, [myPlayers, marketPlayers]);

  const filterPlayers = (players) =>
    players.filter((player) => {
      const matchesSearch = player.name
        .toLowerCase()
        .includes(filters.search.toLowerCase());

      const matchesPosition =
        filters.position === "ALL" || player.position === filters.position;

      return matchesSearch && matchesPosition;
    });

  const filteredMarketPlayers = filterPlayers(marketPlayers);
  const filteredMyPlayers = filterPlayers(myPlayers);

  if (isLoading && !transferScreen) {
    return (
      <div className="page-shell">
        <div className="page-container">
          <InlineLoader text="Átigazolások betöltése..." />
        </div>
      </div>
    );
  }

  if (error && !transferScreen) {
    return (
      <div className="page-shell">
        <div className="page-container">
          <div className="card">
            <p className="error-text">{error}</p>
            <GameNav />
          </div>
        </div>
      </div>
    );
  }

  if (!transferScreen) {
    return (
      <div className="page-shell">
        <div className="page-container">
          <EmptyState title="Nincs átigazolási adat." />
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-container">
        <PageHero
          kicker="Transfer Market"
          title="Átigazolások"
          subtitle={`${transferScreen.team?.name} (${transferScreen.team?.shortName})`}
        >
          <GameNav />
          <p className="muted-text">
            Budget: €{Number(transferScreen?.team?.budget || 0).toLocaleString()}
          </p>
        </PageHero>

        {error && <p className="error-text">{error}</p>}

        <div className="transfer-filter-card card">
          <div>
            <h2>Játékoskereső</h2>
            <p className="muted-text">
              Szűrj név vagy pozíció alapján a piac és a saját keret között.
            </p>
          </div>

          <div className="transfer-filter-controls">
            <input
              type="text"
              placeholder="Játékos keresése..."
              value={filters.search}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  search: event.target.value,
                }))
              }
            />

            <select
              value={filters.position}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  position: event.target.value,
                }))
              }
            >
              {positionOptions.map((position) => (
                <option key={position} value={position}>
                  {position === "ALL" ? "Minden pozíció" : position}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="transfer-layout">
          <section className="card">
            <div className="section-heading-row">
              <div>
                <h2>Piacon lévő játékosok</h2>
                <p className="muted-text">
                  Vásárlás után a játékos automatikusan a keretedbe kerül.
                </p>
              </div>
            </div>

            {filteredMarketPlayers.length ? (
              <div className="transfer-card-grid">
                {filteredMarketPlayers.map((player) => (
                  <TransferPlayerCard
                    key={player.id}
                    player={player}
                    meta={player.team?.shortName}
                    actionLabel={isBuyingPlayer ? "Vásárlás..." : "Megvesz"}
                    disabled={isActionRunning}
                    onAction={handleBuy}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Nincs találat a piacon."
                description="Próbálj másik keresést vagy pozíciószűrőt."
              />
            )}
          </section>

          <section className="card">
            <div className="section-heading-row">
              <div>
                <h2>Saját keret</h2>
                <p className="muted-text">
                  A játékosokat piacra teheted vagy leveheted a listáról.
                </p>
              </div>
            </div>

            {filteredMyPlayers.length ? (
              <div className="transfer-card-grid">
                {filteredMyPlayers.map((player) => (
                  <TransferPlayerCard
                    key={player.id}
                    player={player}
                    meta={player.role}
                    actionLabel={
                      player.isTransferListed
                        ? isUpdatingTransferStatus
                          ? "Módosítás..."
                          : "Levétel"
                        : isUpdatingTransferStatus
                          ? "Módosítás..."
                          : "Piacra tesz"
                    }
                    actionClassName={
                      player.isTransferListed ? "danger-btn" : undefined
                    }
                    disabled={isActionRunning}
                    onAction={
                      player.isTransferListed ? handleUnlist : handleList
                    }
                  />
                ))}
              </div>
            ) : (
              <EmptyState title="Nincs találat a saját keretben." />
            )}
          </section>
        </div>

        <div className="transfer-layout secondary-transfer-layout">
          <section className="card">
            <h2>Saját listázott játékosok</h2>

            {myListedPlayers.length ? (
              <div className="listed-player-list">
                {myListedPlayers.map((player) => (
                  <div key={player.id} className="listed-player-row">
                    <span>
                      <strong>{player.name}</strong> ({player.position})
                    </span>

                    <strong>{formatValue(player.marketValue)}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="Nincs saját listázott játékos." />
            )}
          </section>

          <section className="card">
            <h2>Legutóbbi átigazolások</h2>

            {recentTransfers.length ? (
              <div className="transfer-history-list">
                {recentTransfers.map((item) => (
                  <div key={item.id} className="transfer-history-row">
                    <div>
                      <strong>{item.player?.name}</strong>
                      <p className="muted-text">{item.type}</p>
                    </div>

                    <strong>{formatValue(item.marketValue)}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="Még nincs átigazolási előzmény." />
            )}
          </section>
        </div>

        {isActionRunning && (
          <div className="lineup-inline-loading">Átigazolás frissítése...</div>
        )}
      </div>
    </div>
  );
}