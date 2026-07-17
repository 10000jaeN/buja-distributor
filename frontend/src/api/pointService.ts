import { apiClient } from "@/lib/apiClient";

export type PointTransactionType = "earn" | "spend" | "expire" | "cancel";

export interface PointTransaction {
  _id: string;
  type: PointTransactionType;
  amount: number;
  balance: number;
  reason: string;
  order: string | null;
  createdAt: string;
}

export interface PointHistoryResult {
  balance: number;
  transactions: PointTransaction[];
  total: number;
  page: number;
  totalPages: number;
}

export const pointService = {
  getHistory: async (page = 1, limit = 20): Promise<PointHistoryResult> => {
    return apiClient.get<PointHistoryResult>("/points/history", { params: { page, limit } });
  },
};
