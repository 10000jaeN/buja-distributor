import { apiClient } from "@/lib/apiClient";

export interface CreateOrderPayload {
  items: { productId: string; quantity: number }[];
  shippingAddress: {
    recipientName: string;
    phoneNumber: string;
    zipCode: string;
    mainAddress: string;
    detailAddress?: string;
  };
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
  createOrder: async (data: CreateOrderPayload): Promise<{ orderId: string }> => {
    return apiClient.post<{ orderId: string }>("/orders", data);
  },

  confirmPayment: async (data: ConfirmPaymentPayload): Promise<ConfirmPaymentResult> => {
    return apiClient.post<ConfirmPaymentResult>("/payments/confirm", data);
  },
};
