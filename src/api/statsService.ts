import axiosInstance from "@/lib/axios";

export type MonthlySale = {
  _id: number; // 월 (1~12)
  revenue: number;
  orders: number;
};

export type ProductRank = {
  _id: string;
  name: string;
  quantity: number;
  revenue: number;
};

export type CategoryRevenue = {
  _id: string;
  revenue: number;
};

export type OrderStats = {
  monthlySales: MonthlySale[];
  productRanking: ProductRank[];
  categoryRevenue: CategoryRevenue[];
};

export const statsService = {
  getOrderStats: async (year: number): Promise<OrderStats> => {
    const res = await axiosInstance.get<OrderStats>("/orders/stats", {
      params: { year },
    });
    return res.data;
  },
};
