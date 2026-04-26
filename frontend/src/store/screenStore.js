import { create } from "zustand";
import {
  buyTransferPlayer,
  completeCurrentRound,
  getFixturesScreen,
  getSquadScreen,
  getStandingsScreen,
  getTransferScreen,
  playMyNextMatch,
  simulateCurrentRound,
  updatePlayerLineupPosition,
  updatePlayerRole,
  updatePlayerTransferListStatus,
} from "../api/screenApi";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export const useScreenStore = create((set, get) => ({
  squadScreen: null,
  transferScreen: null,
  fixturesScreen: null,
  standingsScreen: null,

  isLoadingSquadScreen: false,
  isLoadingTransferScreen: false,
  isLoadingFixturesScreen: false,
  isLoadingStandingsScreen: false,

  isPlayingMyMatch: false,
  isSimulatingRound: false,
  isCompletingRound: false,

  isBuyingPlayer: false,
  isUpdatingTransferStatus: false,
  isUpdatingSquadPlayer: false,

  squadScreenError: null,
  transferScreenError: null,
  fixturesScreenError: null,
  standingsScreenError: null,

  resetScreens: () =>
    set({
      squadScreen: null,
      transferScreen: null,
      fixturesScreen: null,
      standingsScreen: null,

      isLoadingSquadScreen: false,
      isLoadingTransferScreen: false,
      isLoadingFixturesScreen: false,
      isLoadingStandingsScreen: false,

      isPlayingMyMatch: false,
      isSimulatingRound: false,
      isCompletingRound: false,

      isBuyingPlayer: false,
      isUpdatingTransferStatus: false,
      isUpdatingSquadPlayer: false,

      squadScreenError: null,
      transferScreenError: null,
      fixturesScreenError: null,
      standingsScreenError: null,
    }),

  loadSquadScreen: async (saveId) => {
    if (!saveId) return null;

    set({
      isLoadingSquadScreen: true,
      squadScreenError: null,
    });

    try {
      const squadScreen = await getSquadScreen(saveId);

      set({
        squadScreen,
        isLoadingSquadScreen: false,
      });

      return squadScreen;
    } catch (error) {
      set({
        squadScreen: null,
        isLoadingSquadScreen: false,
        squadScreenError: getErrorMessage(
          error,
          "Nem sikerült betölteni a keret oldalt."
        ),
      });

      throw error;
    }
  },

  loadTransferScreen: async (saveId) => {
    if (!saveId) return null;

    set({
      isLoadingTransferScreen: true,
      transferScreenError: null,
    });

    try {
      const transferScreen = await getTransferScreen(saveId);

      set({
        transferScreen,
        isLoadingTransferScreen: false,
      });

      return transferScreen;
    } catch (error) {
      set({
        transferScreen: null,
        isLoadingTransferScreen: false,
        transferScreenError: getErrorMessage(
          error,
          "Nem sikerült betölteni az átigazolási oldalt."
        ),
      });

      throw error;
    }
  },

  loadFixturesScreen: async (saveId) => {
    if (!saveId) return null;

    set({
      isLoadingFixturesScreen: true,
      fixturesScreenError: null,
    });

    try {
      const fixturesScreen = await getFixturesScreen(saveId);

      set({
        fixturesScreen,
        isLoadingFixturesScreen: false,
      });

      return fixturesScreen;
    } catch (error) {
      set({
        fixturesScreen: null,
        isLoadingFixturesScreen: false,
        fixturesScreenError: getErrorMessage(
          error,
          "Nem sikerült betölteni a meccsek oldalt."
        ),
      });

      throw error;
    }
  },

  loadStandingsScreen: async (saveId) => {
    if (!saveId) return null;

    set({
      isLoadingStandingsScreen: true,
      standingsScreenError: null,
    });

    try {
      const standingsScreen = await getStandingsScreen(saveId);

      set({
        standingsScreen,
        isLoadingStandingsScreen: false,
      });

      return standingsScreen;
    } catch (error) {
      set({
        standingsScreen: null,
        isLoadingStandingsScreen: false,
        standingsScreenError: getErrorMessage(
          error,
          "Nem sikerült betölteni a tabellát."
        ),
      });

      throw error;
    }
  },

  playMyMatch: async (saveId, payload) => {
    set({
      isPlayingMyMatch: true,
      fixturesScreenError: null,
    });

    try {
      const result = await playMyNextMatch(saveId, payload);
      await get().loadFixturesScreen(saveId);

      set({
        isPlayingMyMatch: false,
      });

      return result;
    } catch (error) {
      set({
        isPlayingMyMatch: false,
        fixturesScreenError: getErrorMessage(
          error,
          "Nem sikerült lejátszani a saját meccset."
        ),
      });

      throw error;
    }
  },

  simulateRestOfRound: async (saveId) => {
    set({
      isSimulatingRound: true,
      fixturesScreenError: null,
    });

    try {
      const result = await simulateCurrentRound(saveId);
      await get().loadFixturesScreen(saveId);

      set({
        isSimulatingRound: false,
      });

      return result;
    } catch (error) {
      set({
        isSimulatingRound: false,
        fixturesScreenError: getErrorMessage(
          error,
          "Nem sikerült szimulálni a fordulót."
        ),
      });

      throw error;
    }
  },

  completeRound: async (saveId) => {
    set({
      isCompletingRound: true,
      fixturesScreenError: null,
    });

    try {
      const result = await completeCurrentRound(saveId);
      await get().loadFixturesScreen(saveId);

      set({
        isCompletingRound: false,
      });

      return result;
    } catch (error) {
      set({
        isCompletingRound: false,
        fixturesScreenError: getErrorMessage(
          error,
          "Nem sikerült befejezni a fordulót."
        ),
      });

      throw error;
    }
  },

  buyPlayer: async (saveId, playerId) => {
    set({
      isBuyingPlayer: true,
      transferScreenError: null,
    });

    try {
      const result = await buyTransferPlayer(saveId, playerId);

      await Promise.all([
        get().loadTransferScreen(saveId),
        get().loadSquadScreen(saveId),
      ]);

      set({
        isBuyingPlayer: false,
      });

      return result;
    } catch (error) {
      set({
        isBuyingPlayer: false,
        transferScreenError: getErrorMessage(
          error,
          "Nem sikerült megvenni a játékost."
        ),
      });

      throw error;
    }
  },

  setPlayerTransferStatus: async (saveId, playerId, isTransferListed) => {
    set({
      isUpdatingTransferStatus: true,
      transferScreenError: null,
    });

    try {
      const result = await updatePlayerTransferListStatus(
        saveId,
        playerId,
        isTransferListed
      );

      await Promise.all([
        get().loadTransferScreen(saveId),
        get().loadSquadScreen(saveId),
      ]);

      set({
        isUpdatingTransferStatus: false,
      });

      return result;
    } catch (error) {
      set({
        isUpdatingTransferStatus: false,
        transferScreenError: getErrorMessage(
          error,
          "Nem sikerült módosítani a játékos átigazolási státuszát."
        ),
      });

      throw error;
    }
  },

  setPlayerRole: async (saveId, playerId, role) => {
    set({
      isUpdatingSquadPlayer: true,
      squadScreenError: null,
    });

    try {
      const result = await updatePlayerRole(saveId, playerId, role);

      await Promise.all([
        get().loadSquadScreen(saveId),
        get().loadTransferScreen(saveId),
      ]);

      set({
        isUpdatingSquadPlayer: false,
      });

      return result;
    } catch (error) {
      set({
        isUpdatingSquadPlayer: false,
        squadScreenError: getErrorMessage(
          error,
          "Nem sikerült módosítani a játékos szerepkörét."
        ),
      });

      throw error;
    }
  },

  setPlayerLineupPosition: async (saveId, playerId, lineupPosition) => {
    set({
      isUpdatingSquadPlayer: true,
      squadScreenError: null,
    });

    try {
      const result = await updatePlayerLineupPosition(
        saveId,
        playerId,
        lineupPosition || null
      );

      await get().loadSquadScreen(saveId);

      set({
        isUpdatingSquadPlayer: false,
      });

      return result;
    } catch (error) {
      set({
        isUpdatingSquadPlayer: false,
        squadScreenError: getErrorMessage(
          error,
          "Nem sikerült módosítani a játékos pozícióját."
        ),
      });

      throw error;
    }
  },
}));