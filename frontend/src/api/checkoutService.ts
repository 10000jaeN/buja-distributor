import { apiClient } from "@/lib/apiClient";

export interface PreviewOrderPayload {
  items: { productId: string; quantity: number }[];
  mainAddress: string;
  userCouponId?: string;
  pointsToUse?: number;
}

export interface PreviewOrderResult {
  itemSubtotal: number;
  discountAmount: number;
  promotion: { promotionId: string; name: string; discountAmount: number } | null;
  coupon: { couponId: string; code: string; discountAmount: number } | null;
  pointsToUse: number;
  baseShippingFee: number;
  extraShippingFee: number;
  shippingFee: number;
  totalAmount: number;
}

export interface CreateOrderPayload {
  items: { productId: string; quantity: number }[];
  shippingAddress: {
    recipientName: string;
    phoneNumber: string;
    zipCode: string;
    mainAddress: string;
    detailAddress?: string;
  };
  userCouponId?: string;
  pointsToUse?: number;
}

export interface ConfirmPaymentPayload {
  paymentKey: string;
  orderId: string;
  amount: number;
}

export interface ConfirmPaymentResult {
  orderId: string;
  orderNumber: string;
  paymentMethod: string;
  paymentProvider: string | null;
}

export const checkoutService = {
  previewOrder: async (data: PreviewOrderPayload): Promise<PreviewOrderResult> => {
    return apiClient.post<PreviewOrderResult>("/orders/preview", data);
  },

  createOrder: async (data: CreateOrderPayload): Promise<{ orderId: string; totalAmount: number }> => {
    return apiClient.post<{ orderId: string; totalAmount: number }>("/orders", data);
  },

  confirmPayment: async (data: ConfirmPaymentPayload): Promise<ConfirmPaymentResult> => {
    return apiClient.post<ConfirmPaymentResult>("/payments/confirm", data);
  },

};
