import { create } from "zustand";
import { getMySaveResumeSummary } from "../api/savesApi";

const ACTIVE_SAVE_KEY = "activeSaveId";

const getStoredActiveSaveId = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_SAVE_KEY) || null;
};

const persistActiveSaveId = (saveId) => {
  if (typeof window === "undefined") return;

  if (saveId) {
    localStorage.setItem(ACTIVE_SAVE_KEY, saveId);
  } else {
    localStorage.removeItem(ACTIVE_SAVE_KEY);
  }
};

export const useGameStore = create((set, get) => ({
  activeSaveId: getStoredActiveSaveId(),
  activeSaveSummary: null,
  isLoadingActiveSaveSummary: false,
  gameError: null,

  clearGameError: () => set({ gameError: null }),

  setActiveSave: async (saveId) => {
    persistActiveSaveId(saveId);

    set({
      activeSaveId: saveId,
      isLoadingActiveSaveSummary: true,
      gameError: null,
    });

    try {
      const summary = await getMySaveResumeSummary(saveId);

      set({
        activeSaveSummary: summary,
        isLoadingActiveSaveSummary: false,
      });

      return summary;
    } catch (error) {
      set({
        activeSaveSummary: null,
        isLoadingActiveSaveSummary: false,
        gameError:
          error?.response?.data?.message ||
          error?.message ||
          "Nem sikerült betölteni az aktív mentést.",
      });

      throw error;
    }
  },

  clearActiveSave: () => {
    persistActiveSaveId(null);

    set({
      activeSaveId: null,
      activeSaveSummary: null,
      isLoadingActiveSaveSummary: false,
      gameError: null,
    });
  },

  loadActiveSaveSummary: async () => {
    const saveId = get().activeSaveId;

    if (!saveId) {
      set({
        activeSaveSummary: null,
        isLoadingActiveSaveSummary: false,
      });
      return null;
    }

    set({
      isLoadingActiveSaveSummary: true,
      gameError: null,
    });

    try {
      const summary = await getMySaveResumeSummary(saveId);

      set({
        activeSaveSummary: summary,
        isLoadingActiveSaveSummary: false,
      });

      return summary;
    } catch (error) {
      set({
        activeSaveSummary: null,
        isLoadingActiveSaveSummary: false,
        gameError:
          error?.response?.data?.message ||
          error?.message ||
          "Nem sikerült betölteni a mentés összefoglalót.",
      });

      throw error;
    }
  },

  resetGameState: () => {
    persistActiveSaveId(null);

    set({
      activeSaveId: null,
      activeSaveSummary: null,
      isLoadingActiveSaveSummary: false,
      gameError: null,
    });
  },
}));