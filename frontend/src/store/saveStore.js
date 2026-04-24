import { create } from "zustand";
import {
  createMySave,
  deleteMySave,
  getBaseTeamsWithPlayers,
  getMySaves,
} from "../api/savesApi";
import { useGameStore } from "./gameStore";

export const useSaveStore = create((set, get) => ({
  saves: [],
  teams: [],
  isLoadingSaves: false,
  isLoadingTeams: false,
  isCreatingSave: false,
  isDeletingSave: false,
  saveError: null,

  clearSaveError: () => set({ saveError: null }),

  resetSaveState: () =>
    set({
      saves: [],
      teams: [],
      isLoadingSaves: false,
      isLoadingTeams: false,
      isCreatingSave: false,
      isDeletingSave: false,
      saveError: null,
    }),

  loadMySaves: async () => {
    set({
      isLoadingSaves: true,
      saveError: null,
    });

    try {
      const saves = await getMySaves();

      set({
        saves,
        isLoadingSaves: false,
      });

      return saves;
    } catch (error) {
      set({
        isLoadingSaves: false,
        saveError:
          error?.response?.data?.message ||
          error?.message ||
          "Nem sikerült betölteni a mentéseket.",
      });

      throw error;
    }
  },

  loadBaseTeams: async () => {
    set({
      isLoadingTeams: true,
      saveError: null,
    });

    try {
      const teams = await getBaseTeamsWithPlayers();

      set({
        teams,
        isLoadingTeams: false,
      });

      return teams;
    } catch (error) {
      set({
        isLoadingTeams: false,
        saveError:
          error?.response?.data?.message ||
          error?.message ||
          "Nem sikerült betölteni a csapatokat.",
      });

      throw error;
    }
  },

  loadSaveSelectorData: async () => {
    set({
      isLoadingSaves: true,
      isLoadingTeams: true,
      saveError: null,
    });

    try {
      const [saves, teams] = await Promise.all([
        getMySaves(),
        getBaseTeamsWithPlayers(),
      ]);

      set({
        saves,
        teams,
        isLoadingSaves: false,
        isLoadingTeams: false,
      });

      return { saves, teams };
    } catch (error) {
      set({
        isLoadingSaves: false,
        isLoadingTeams: false,
        saveError:
          error?.response?.data?.message ||
          error?.message ||
          "Nem sikerült betölteni a mentésválasztó adatokat.",
      });

      throw error;
    }
  },

  createSave: async (payload) => {
    set({
      isCreatingSave: true,
      saveError: null,
    });

    try {
      const response = await createMySave(payload);

      await get().loadMySaves();

      set({
        isCreatingSave: false,
      });

      return response;
    } catch (error) {
      set({
        isCreatingSave: false,
        saveError:
          error?.response?.data?.message ||
          error?.message ||
          "Nem sikerült létrehozni a mentést.",
      });

      throw error;
    }
  },

  deleteSave: async (saveId) => {
    set({
      isDeletingSave: true,
      saveError: null,
    });

    try {
      await deleteMySave(saveId);

      set((state) => ({
        saves: state.saves.filter((save) => save.id !== saveId),
        isDeletingSave: false,
      }));

      const { activeSaveId, clearActiveSave } = useGameStore.getState();

      if (activeSaveId === saveId) {
        clearActiveSave();
      }

      return true;
    } catch (error) {
      set({
        isDeletingSave: false,
        saveError:
          error?.response?.data?.message ||
          error?.message ||
          "Nem sikerült törölni a mentést.",
      });

      throw error;
    }
  },
}));