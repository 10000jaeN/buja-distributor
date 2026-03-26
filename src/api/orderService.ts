import axiosInstance from "@/lib/axios";

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderItem = {
  productId: string;
  name: string;
  quantity: number;
  price: number;
};

export type Order = {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
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
};
