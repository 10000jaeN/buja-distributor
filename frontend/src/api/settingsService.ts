import { apiClient } from "@/lib/apiClient";

export type SiteSettings = {
  bundleFreeThreshold: number;
};

export const settingsService = {
  getSettings: async (): Promise<SiteSettings> => {
    return apiClient.get<SiteSettings>("/settings");
  },

  updateSettings: async (data: Partial<SiteSettings>): Promise<SiteSettings> => {
    return apiClient.patch<SiteSettings>("/settings", data);
  },
};
