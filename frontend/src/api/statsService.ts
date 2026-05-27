import { apiClient } from "@/lib/apiClient";

export type MonthlySale = {
  _id: number;
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

export type UnprocessedOrder = {
  orderNumber: string;
  paidAt: string;
  totalAmount: number;
};

export type MonthlyStats = {
  year: number;
  month: number;
  totalRevenue: number;
  productRevenue: number;
  shippingRevenue: number;
  orderCount: number;
  cancelledCount: number;
  averageOrderValue: number;
  prevTotalRevenue: number;
  prevOrderCount: number;
  revenueGrowthRate: number | null;
  unprocessedOrders: UnprocessedOrder[];
};

export const statsService = {
  getOrderStats: async (year: number): Promise<OrderStats> => {
    return apiClient.get<OrderStats>("/orders/stats", { params: { year } });
  },

  getMonthlyStats: async (year: number, month: number): Promise<MonthlyStats> => {
    return apiClient.get<MonthlyStats>("/orders/monthly-stats", {
      params: { year, month },
    });
  },
};
