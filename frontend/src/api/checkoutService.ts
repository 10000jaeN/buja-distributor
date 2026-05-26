import axiosInstance from "@/lib/axios";

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
  createOrder: async (
    data: CreateOrderPayload
  ): Promise<{ orderId: string }> => {
    const res = await axiosInstance.post("/orders", data);
    return res.data;
  },

  confirmPayment: async (
    data: ConfirmPaymentPayload
  ): Promise<ConfirmPaymentResult> => {
    const res = await axiosInstance.post("/payments/confirm", data);
    return res.data;
  },
};
