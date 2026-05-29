import { Order, OrderStatus } from "@/api/orderService";
import { DateRange } from "react-day-picker";

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "결제 대기",
  paid: "결제 완료",
  processing: "상품 준비 중",
  shipped: "배송 중",
  delivered: "배송 완료",
  cancelled: "취소됨",
};

export const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: "bg-yellow-50 text-yellow-600",
  paid: "bg-blue-50 text-brand-blue",
  processing: "bg-purple-50 text-purple-600",
  shipped: "bg-indigo-50 text-indigo-600",
  delivered: "bg-green-50 text-green-600",
  cancelled: "bg-gray-100 text-gray-500",
};

export const ALL_STATUSES: OrderStatus[] = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export function formatDate(iso?: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export function filterOrders(
  orders: Order[],
  searchQuery: string,
  filterStatus: string,
  dateRange?: DateRange,
): Order[] {
  return orders.filter((o) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      (o.orderNumber ?? "").toLowerCase().includes(q) ||
      (o.user?.nickName ?? "").toLowerCase().includes(q) ||
      (o.user?.email ?? "").toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || o.status === filterStatus;

    let matchDate = true;
    if (dateRange?.from) {
      const orderDate = new Date(o.createdAt);
      const from = new Date(dateRange.from);
      from.setHours(0, 0, 0, 0);
      const to = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from);
      to.setHours(23, 59, 59, 999);
      matchDate = orderDate >= from && orderDate <= to;
    }

    return matchSearch && matchStatus && matchDate;
  });
}
