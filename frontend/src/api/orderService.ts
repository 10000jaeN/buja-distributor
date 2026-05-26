import axiosInstance from "@/lib/axios";

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderItem = {
  productId: string | { _id: string; slug?: string };
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
  userName: string;
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
    const res = await axiosInstance.get("/orders");
    return Array.isArray(res.data) ? res.data : (res.data.orders ?? []);
  },

  getOrder: async (id: string): Promise<Order> => {
    const res = await axiosInstance.get<{ data: Order }>(`/orders/${id}`);
    return res.data.data;
  },

  cancelOrder: async (id: string): Promise<Order> => {
    const res = await axiosInstance.patch<{ data: Order }>(`/orders/${id}/cancel`);
    return res.data.data;
  },

  // Admin endpoints
  getAllOrders: async (): Promise<Order[]> => {
    const res = await axiosInstance.get("/orders/all");
    return Array.isArray(res.data) ? res.data : (res.data.orders ?? []);
  },

  startPreparation: async (id: string): Promise<void> => {
    await axiosInstance.patch(`/orders/${id}/prepare`);
  },

  startShipping: async (id: string, courierName: string, trackingNumber: string): Promise<void> => {
    await axiosInstance.patch(`/orders/${id}/shipping`, { courierName, trackingNumber });
  },

  completeDelivery: async (id: string): Promise<void> => {
    await axiosInstance.patch(`/orders/${id}/complete`);
  },
};
