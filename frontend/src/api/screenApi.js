import http from "./http";

export const getSquadScreen = async (saveId) => {
  const { data } = await http.get(`/users/saves/${saveId}/screens/squad`);
  return data;
};

export const getTransferScreen = async (saveId) => {
  const { data } = await http.get(`/users/saves/${saveId}/screens/transfer`);
  return data;
};

export const getFixturesScreen = async (saveId) => {
  const { data } = await http.get(`/users/saves/${saveId}/screens/fixtures`);
  return data;
};

export const getStandingsScreen = async (saveId) => {
  const { data } = await http.get(`/users/saves/${saveId}/screens/standings`);
  return data;
};

export const getSelectedTeamLineup = async (saveId) => {
  const { data } = await http.get(
    `/squad/saves/${saveId}/selected-team/lineup`
  );
  return data;
};

export const saveSelectedTeamLineup = async (saveId, payload) => {
  const { data } = await http.put(
    `/squad/saves/${saveId}/selected-team/lineup`,
    payload
  );
  return data;
};

export const autoPickSelectedTeamLineup = async (saveId) => {
  const { data } = await http.post(
    `/squad/saves/${saveId}/selected-team/lineup/auto-pick`
  );
  return data;
};

export const playMyNextMatch = async (saveId, payload) => {
  const { data } = await http.post(
    `/users/saves/${saveId}/selected-team/play-next-match`,
    payload
  );
  return data;
};

export const simulateCurrentRound = async (saveId) => {
  const { data } = await http.post(
    `/users/saves/${saveId}/simulate-current-round`
  );
  return data;
};

export const completeCurrentRound = async (saveId) => {
  const { data } = await http.post(
    `/users/saves/${saveId}/complete-current-round`
  );
  return data;
};

export const buyTransferPlayer = async (saveId, playerId) => {
  const { data } = await http.post(
    `/users/saves/${saveId}/transfer-listed-players/${playerId}/buy`
  );
  return data;
};

export const updatePlayerTransferListStatus = async (
  saveId,
  playerId,
  isTransferListed
) => {
  const { data } = await http.patch(
    `/users/saves/${saveId}/players/${playerId}/transfer-list-status`,
    { isTransferListed }
  );
  return data;
};

export const updatePlayerRole = async (saveId, playerId, role) => {
  const { data } = await http.patch(
    `/users/saves/${saveId}/players/${playerId}/role`,
    { role }
  );
  return data;
};

export const updatePlayerLineupPosition = async (
  saveId,
  playerId,
  lineupPosition
) => {
  const { data } = await http.patch(
    `/users/saves/${saveId}/players/${playerId}/lineup-position`,
    { lineupPosition }
  );
  return data;
};