import axiosInstance from "@/lib/axios";

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
  nickName: string;
  roles: string[];
  address: Address[];
  createdAt: string;
};

export const userService = {
  getProfile: async (): Promise<UserProfile> => {
    const res = await axiosInstance.get<{ data: UserProfile }>("/user");
    return res.data.data;
  },

  updateProfile: async (data: { nickName?: string }): Promise<UserProfile> => {
    const res = await axiosInstance.patch<{ data: UserProfile }>("/user", data);
    return res.data.data;
  },

  addAddress: async (data: Omit<Address, "_id" | "isDefault"> & { isDefault?: boolean }): Promise<Address[]> => {
    const res = await axiosInstance.post<{ data: Address[] }>("/user/address", data);
    return res.data.data;
  },

  updateAddress: async (addressId: string, data: Partial<Omit<Address, "_id" | "isDefault">>): Promise<Address[]> => {
    const res = await axiosInstance.patch<{ data: Address[] }>(`/user/address/${addressId}`, data);
    return res.data.data;
  },

  deleteAddress: async (addressId: string): Promise<Address[]> => {
    const res = await axiosInstance.delete<{ data: Address[] }>(`/user/address/${addressId}`);
    return res.data.data;
  },

  setDefaultAddress: async (addressId: string): Promise<Address[]> => {
    const res = await axiosInstance.patch<{ data: Address[] }>(`/user/address/${addressId}/default`);
    return res.data.data;
  },
};
