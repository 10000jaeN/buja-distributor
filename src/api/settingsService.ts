import axiosInstance from "@/lib/axios";

export type SiteSettings = {
  bundleFreeThreshold: number;
};

export const settingsService = {
  getSettings: async (): Promise<SiteSettings> => {
    const res = await axiosInstance.get<SiteSettings>("/settings");
    return res.data;
  },

  updateSettings: async (data: Partial<SiteSettings>): Promise<SiteSettings> => {
    const res = await axiosInstance.patch<SiteSettings>("/settings", data);
    return res.data;
  },
};
