import { create } from "zustand";
import { getDashboard } from "../api/dashboardApi";

export const useDashboardStore = create((set) => ({
  dashboard: null,
  isLoadingDashboard: false,
  dashboardError: null,

  clearDashboardError: () => set({ dashboardError: null }),

  resetDashboard: () =>
    set({
      dashboard: null,
      isLoadingDashboard: false,
      dashboardError: null,
    }),

  loadDashboard: async (saveId) => {
    if (!saveId) {
      set({
        dashboard: null,
        isLoadingDashboard: false,
        dashboardError: "Nincs aktív mentés.",
      });
      return null;
    }

    set({
      isLoadingDashboard: true,
      dashboardError: null,
    });

    try {
      const dashboard = await getDashboard(saveId);

      set({
        dashboard,
        isLoadingDashboard: false,
        dashboardError: null,
      });

      return dashboard;
    } catch (error) {
      set({
        dashboard: null,
        isLoadingDashboard: false,
        dashboardError:
          error?.response?.data?.message ||
          error?.message ||
          "Nem sikerült betölteni a dashboardot.",
      });

      throw error;
    }
  },
}));