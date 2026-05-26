"use client";

import { orderService, Order, OrderStatus } from "@/api/orderService";
import { useEffect, useState } from "react";

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "결제 대기",
  paid: "결제 완료",
  processing: "상품 준비중",
  shipped: "배송중",
  delivered: "배송 완료",
  cancelled: "취소됨",
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: "bg-yellow-50 text-yellow-600",
  paid: "bg-blue-50 text-brand-blue",
  processing: "bg-purple-50 text-purple-600",
  shipped: "bg-indigo-50 text-indigo-600",
  delivered: "bg-green-50 text-green-600",
  cancelled: "bg-gray-100 text-gray-500",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    orderService
      .getOrders()
      .then(setOrders)
      .catch(() => setError("주문 내역을 불러오지 못했습니다."))
      .finally(() => setIsLoading(false));
  }, []);

  const handleCancel = async (orderId: string) => {
    if (!confirm("주문을 취소할까요?")) return;
    try {
      const updated = await orderService.cancelOrder(orderId);
      setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
    } catch {
      alert("주문 취소에 실패했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <div className="border-t-brand-blue h-7 w-7 animate-spin rounded-full border-3 border-gray-200" />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-gray-500">{error}</p>;
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-10 text-center shadow-sm">
        <p className="text-sm text-gray-400">주문 내역이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order._id}
          className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
        >
          {/* 주문 헤더 */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">
                {new Date(order.createdAt).toLocaleDateString("ko-KR")}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-gray-700">
                주문번호: {order.orderNumber}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLOR[order.status]}`}
            >
              {STATUS_LABEL[order.status]}
            </span>
          </div>

          {/* 주문 아이템 */}
          <div className="divide-y divide-gray-50">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2.5">
                <p className="text-sm text-gray-700">
                  {item.name}
                  <span className="ml-1 text-gray-400">× {item.quantity}</span>
                </p>
                <p className="text-sm font-medium text-gray-800">
                  {(item.price * item.quantity).toLocaleString()}원
                </p>
              </div>
            ))}
          </div>

          {/* 배송 정보 */}
          {order.trackingNumber && (
            <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
              배송사: {order.courierName} · 운송장: {order.trackingNumber}
            </div>
          )}

          {/* 합계 + 취소 */}
          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
            <p className="text-sm font-bold text-gray-900">
              합계{" "}
              <span className="text-brand-blue">
                {order.totalAmount.toLocaleString()}원
              </span>
            </p>
            {(order.status === "pending" || order.status === "paid") && (
              <button
                onClick={() => handleCancel(order._id)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 hover:border-red-200 hover:text-red-500"
              >
                주문 취소
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
