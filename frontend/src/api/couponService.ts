import { apiClient } from "@/lib/apiClient";

export type CouponType = "percentage" | "fixed";

export type Coupon = {
  _id: string;
  code: string;
  name: string;
  type: CouponType;
  value: number;
  maxDiscount: number | null;
  minOrderAmount: number | null;
  maxUses: number | null;
  maxUsesPerUser: number;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
};

export type CouponFormData = {
  code: string;
  name: string;
  type: CouponType;
  value: number;
  maxDiscount?: number | null;
  minOrderAmount?: number | null;
  maxUses?: number | null;
  maxUsesPerUser?: number;
  expiresAt?: string | null;
  isActive?: boolean;
};

export type UserCoupon = {
  _id: string;
  coupon: Coupon;
  status: "available" | "used";
  issuedAt: string;
  usedAt: string | null;
};

export const couponService = {
  // 어드민
  getAll: async (): Promise<Coupon[]> => {
    return apiClient.get<Coupon[]>("/coupons");
  },
  create: async (data: CouponFormData): Promise<Coupon> => {
    return apiClient.post<Coupon>("/coupons", data);
  },
  update: async (id: string, data: Partial<Omit<CouponFormData, "code">>): Promise<Coupon> => {
    return apiClient.patch<Coupon>(`/coupons/${id}`, data);
  },
  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/coupons/${id}`);
  },

  // 유저 — 쿠폰함
  claim: async (code: string): Promise<{ message: string; coupon: Pick<Coupon, "code" | "name" | "type" | "value" | "expiresAt"> }> => {
    return apiClient.post("/coupons/claim", { code });
  },
  getMyCoupons: async (status?: "available" | "used"): Promise<UserCoupon[]> => {
    return apiClient.get<UserCoupon[]>("/coupons/mine", { params: status ? { status } : undefined });
  },
};
