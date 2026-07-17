import { apiClient } from "@/lib/apiClient";

export type PromotionType = "percentage" | "fixed";
export type PromotionTarget = "product" | "category" | "all";

export type Promotion = {
  _id: string;
  name: string;
  description: string;
  type: PromotionType;
  value: number;
  target: PromotionTarget;
  targetIds: string[];
  minQuantity: number | null;
  minOrderAmount: number | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
};

export type PromotionFormData = {
  name: string;
  description?: string;
  type: PromotionType;
  value: number;
  target: PromotionTarget;
  targetIds?: string[];
  minQuantity?: number | null;
  minOrderAmount?: number | null;
  startDate: string;
  endDate: string;
  isActive?: boolean;
};

export const promotionService = {
  getAll: async (): Promise<Promotion[]> => {
    return apiClient.get<Promotion[]>("/promotions");
  },

  getActive: async (productIds: string[], categoryParents: string[]): Promise<Promotion[]> => {
    return apiClient.get<Promotion[]>("/promotions/active", {
      params: {
        productIds: productIds.join(","),
        categoryParents: categoryParents.join(","),
      },
    });
  },

  create: async (data: PromotionFormData): Promise<Promotion> => {
    return apiClient.post<Promotion>("/promotions", data);
  },

  update: async (id: string, data: Partial<PromotionFormData>): Promise<Promotion> => {
    return apiClient.patch<Promotion>(`/promotions/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/promotions/${id}`);
  },
};
