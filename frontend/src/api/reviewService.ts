import { apiClient } from "@/lib/apiClient";

export type Review = {
  _id: string;
  productId: { _id: string; name: string; thumbnail: string[]; slug: string } | string;
  orderId?: string;
  rating: number;
  content: string;
  images?: string[];
  createdAt: string;
  userId?: { userName: string };
};

export type CreateReviewInput = {
  productId: string;
  orderId?: string;
  rating: number;
  content: string;
  images?: string[];
};

export type UpdateReviewInput = {
  rating?: number;
  content?: string;
  images?: string[];
};

export const reviewService = {
  createReview: async (data: CreateReviewInput): Promise<Review> => {
    const res = await apiClient.post<{ success: boolean; data: Review }>("/reviews", data);
    return res.data;
  },

  getProductReviews: async (productId: string): Promise<Review[]> => {
    const res = await apiClient.get<{ success: boolean; data: Review[] }>(`/reviews/${productId}`);
    return res.data;
  },

  getMyReviews: async (): Promise<Review[]> => {
    const res = await apiClient.get<{ success: boolean; data: Review[] }>("/reviews/my");
    return res.data;
  },

  updateReview: async (reviewId: string, data: UpdateReviewInput): Promise<Review> => {
    const res = await apiClient.patch<{ success: boolean; data: Review }>(`/reviews/${reviewId}`, data);
    return res.data;
  },

  deleteReview: async (reviewId: string): Promise<void> => {
    await apiClient.delete(`/reviews/${reviewId}`);
  },
};
