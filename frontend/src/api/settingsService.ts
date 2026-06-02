import { apiClient } from "@/lib/apiClient";

export type Banner = {
  imageUrl: string;
  linkUrl?: string;
};

export type SiteSettings = {
  bundleFreeThreshold: number;
  banners: Banner[];
};

export const settingsService = {
  getSettings: async (): Promise<SiteSettings> => {
    return apiClient.get<SiteSettings>("/settings");
  },

  updateSettings: async (data: Partial<SiteSettings>): Promise<SiteSettings> => {
    return apiClient.patch<SiteSettings>("/settings", data);
  },
};
