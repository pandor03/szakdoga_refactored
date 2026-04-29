export const POSITION_COMPATIBILITY = {
  GK: { GK: 1, LB: 0, CB: 0, RB: 0, CDM: 0, CM: 0, CAM: 0, LW: 0, RW: 0, ST: 0 },
  LB: { GK: 0, LB: 1, CB: 0.9, RB: 0.9, CDM: 0.75, CM: 0.68, CAM: 0.6, LW: 0.72, RW: 0.6, ST: 0.55 },
  CB: { GK: 0, LB: 0.85, CB: 1, RB: 0.85, CDM: 0.85, CM: 0.72, CAM: 0.6, LW: 0.55, RW: 0.55, ST: 0.52 },
  RB: { GK: 0, LB: 0.9, CB: 0.9, RB: 1, CDM: 0.75, CM: 0.68, CAM: 0.6, LW: 0.6, RW: 0.72, ST: 0.55 },
  CDM: { GK: 0, LB: 0.72, CB: 0.95, RB: 0.72, CDM: 1, CM: 0.92, CAM: 0.75, LW: 0.62, RW: 0.62, ST: 0.58 },
  CM: { GK: 0, LB: 0.7, CB: 0.65, RB: 0.7, CDM: 0.95, CM: 1, CAM: 0.9, LW: 0.72, RW: 0.72, ST: 0.68 },
  CAM: { GK: 0, LB: 0.6, CB: 0.6, RB: 0.6, CDM: 0.72, CM: 0.95, CAM: 1, LW: 0.82, RW: 0.82, ST: 0.9 },
  LW: { GK: 0, LB: 0.62, CB: 0.58, RB: 0.55, CDM: 0.6, CM: 0.72, CAM: 0.84, LW: 1, RW: 0.92, ST: 0.8 },
  RW: { GK: 0, LB: 0.55, CB: 0.58, RB: 0.62, CDM: 0.6, CM: 0.72, CAM: 0.84, LW: 0.92, RW: 1, ST: 0.8 },
  ST: { GK: 0, LB: 0.52, CB: 0.52, RB: 0.52, CDM: 0.58, CM: 0.68, CAM: 0.86, LW: 0.78, RW: 0.78, ST: 1 },
};

export const normalizePosition = (value) => {
  if (!value) return "";

  return String(value)
    .toUpperCase()
    .replace(/[0-9]/g, "")
    .replaceAll("_", "")
    .trim();
};

export const getDisplayedPosition = (player) =>
  normalizePosition(
    player.playedPosition ||
      player.tacticalPosition ||
      player.lineupPosition ||
      player.position
  );

export const getRawOverall = (player) =>
  player.overall ?? player.rating ?? player.ovr ?? player.stats?.overall ?? "-";

export const getPositionMultiplier = (playerPosition, targetPosition) => {
  const from = normalizePosition(playerPosition);
  const to = normalizePosition(targetPosition);

  if (!from || !to) return 1;

  return POSITION_COMPATIBILITY[from]?.[to] ?? 0;
};

export const getFitClassName = (multiplier) => {
  if (multiplier >= 0.95) return "fit-good";
  if (multiplier >= 0.75) return "fit-ok";
  return "fit-bad";
};

export const getFitData = (player) => {
  const targetPosition = getDisplayedPosition(player);

  const multiplier =
    player.positionMultiplier ??
    getPositionMultiplier(player.position, targetPosition);

  return {
    targetPosition: targetPosition || "-",
    multiplier,
    className: getFitClassName(multiplier),
  };
};

export const getFitOverall = (player) => {
  if (player.effectiveOverall !== undefined && player.effectiveOverall !== null) {
    return player.effectiveOverall;
  }

  const rawOverall = Number(getRawOverall(player));
  if (Number.isNaN(rawOverall)) return "-";

  return Math.round(rawOverall * getFitData(player).multiplier);
};

export const getTeamFitOverall = (players) => {
  const values = players
    .slice(0, 11)
    .map((player) => Number(getFitOverall(player)))
    .filter((value) => !Number.isNaN(value));

  if (!values.length) return "-";

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
};