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
};
