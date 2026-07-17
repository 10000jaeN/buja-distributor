import { apiClient } from "@/lib/apiClient";

export type Popup = {
  _id: string;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  couponCode: string | null;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
};

export type PopupFormData = {
  title: string;
  imageUrl: string;
  linkUrl?: string | null;
  couponCode?: string | null;
  isActive?: boolean;
  startDate?: string | null;
  endDate?: string | null;
};

export const popupService = {
  getActive: async (): Promise<Popup[]> => {
    return apiClient.get<Popup[]>("/popups/active");
  },

  getAll: async (): Promise<Popup[]> => {
    return apiClient.get<Popup[]>("/popups");
  },

  create: async (data: PopupFormData): Promise<Popup> => {
    return apiClient.post<Popup>("/popups", data);
  },

  update: async (id: string, data: Partial<PopupFormData>): Promise<Popup> => {
    return apiClient.patch<Popup>(`/popups/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/popups/${id}`);
  },
};
