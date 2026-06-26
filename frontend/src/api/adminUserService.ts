import { apiClient } from "@/lib/apiClient";

export type AdminUser = {
  _id: string;
  nickName: string;
  email?: string;
  provider: "local" | "google" | "kakao" | "naver";
  roles: string[];
  createdAt: string;
};

export const adminUserService = {
  getUsers: async (search?: string): Promise<AdminUser[]> => {
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    const res = await apiClient.get<{ data: AdminUser[] }>(`/admin/users${params}`);
    return res.data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${userId}`);
  },
};
