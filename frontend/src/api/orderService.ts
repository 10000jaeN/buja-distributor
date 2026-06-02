import { apiClient } from "@/lib/apiClient";

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderItem = {
  productId: string | { _id: string; slug?: string; thumbnail?: string[] };
  name: string;
  quantity: number;
  price: number;
};

export function getProductId(item: OrderItem): string {
  if (typeof item.productId === "string") return item.productId;
  return item.productId.slug ?? item.productId._id;
}

export type OrderUser = {
  _id: string;
  nickName: string;
  email: string;
};

export type Order = {
  _id: string;
  orderNumber: string;
  user?: OrderUser;
  items: OrderItem[];
  shippingFee?: number;
  totalAmount: number;
  status: OrderStatus;
  shippingAddress?: {
    recipientName: string;
    phoneNumber: string;
    zipCode: string;
    mainAddress: string;
    detailAddress?: string;
  };
  createdAt: string;
  paidAt?: string;
  cancelledAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  trackingNumber?: string;
  courierName?: string;
};

export const orderService = {
  getOrders: async (): Promise<Order[]> => {
    const res = await apiClient.get<{ orders?: Order[] } | Order[]>("/orders");
    return Array.isArray(res) ? res : (res.orders ?? []);
  },

  getOrder: async (id: string): Promise<Order> => {
    const res = await apiClient.get<{ data: Order }>(`/orders/${id}`);
    return res.data;
  },

  cancelOrder: async (id: string): Promise<{ orderId: string; status: string }> => {
    const res = await apiClient.patch<{ orderId: string; status: string }>(`/orders/${id}/cancel`);
    return res;
  },

  // Admin endpoints
  getAllOrders: async (): Promise<Order[]> => {
    const res = await apiClient.get<{ orders?: Order[] } | Order[]>("/orders/all");
    return Array.isArray(res) ? res : (res.orders ?? []);
  },

  startPreparation: async (id: string): Promise<void> => {
    await apiClient.patch(`/orders/${id}/prepare`);
  },

  startShipping: async (
    id: string,
    courierName: string,
    trackingNumber: string,
  ): Promise<void> => {
    await apiClient.patch(`/orders/${id}/shipping`, { courierName, trackingNumber });
  },

  completeDelivery: async (id: string): Promise<void> => {
    await apiClient.patch(`/orders/${id}/complete`);
  },
};
