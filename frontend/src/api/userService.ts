import { apiClient } from "@/lib/apiClient";

export type Address = {
  _id: string;
  recipientName: string;
  phoneNumber: string;
  zipCode: string;
  mainAddress: string;
  detailAddress: string;
  jibunAddress: string;
  isDefault: boolean;
};

export type UserProfile = {
  _id: string;
  provider: "local" | "google" | "kakao" | "naver";
  email?: string;
  phoneNumber?: string | null;
  nickName: string;
  roles: string[];
  address: Address[];
  createdAt: string;
};

export const userService = {
  getProfile: async (): Promise<UserProfile> => {
    const res = await apiClient.get<{ data: UserProfile }>("/user");
    return res.data;
  },

  updateProfile: async (data: { nickName?: string; phoneNumber?: string | null; email?: string }): Promise<UserProfile> => {
    const res = await apiClient.patch<{ data: UserProfile }>("/user", data);
    return res.data;
  },

  addAddress: async (
    data: Omit<Address, "_id" | "isDefault"> & { isDefault?: boolean },
  ): Promise<Address[]> => {
    const res = await apiClient.post<{ data: Address[] }>("/user/address", data);
    return res.data;
  },

  updateAddress: async (
    addressId: string,
    data: Partial<Omit<Address, "_id" | "isDefault">>,
  ): Promise<Address[]> => {
    const res = await apiClient.patch<{ data: Address[] }>(
      `/user/address/${addressId}`,
      data,
    );
    return res.data;
  },

  deleteAddress: async (addressId: string): Promise<Address[]> => {
    const res = await apiClient.delete<{ data: Address[] }>(
      `/user/address/${addressId}`,
    );
    return res.data;
  },

  setDefaultAddress: async (addressId: string): Promise<Address[]> => {
    const res = await apiClient.patch<{ data: Address[] }>(
      `/user/address/${addressId}/default`,
    );
    return res.data;
  },

  deleteAccount: async (): Promise<void> => {
    await apiClient.delete("/user/delete");
  },
};
