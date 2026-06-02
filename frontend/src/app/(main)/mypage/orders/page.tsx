"use client";

import { orderService, Order, OrderStatus } from "@/api/orderService";
import { reviewService, Review } from "@/api/reviewService";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ReviewWriteDialog from "@/components/shared/ReviewWriteDialog";

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

type ReviewTarget = {
  orderId: string;
  productId: string;
  productName: string;
  existingReview?: Review;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewTarget, setReviewTarget] = useState<ReviewTarget | null>(null);

  useEffect(() => {
    Promise.allSettled([orderService.getOrders(), reviewService.getMyReviews()])
      .then(([ordersResult, reviewsResult]) => {
        if (ordersResult.status === "fulfilled") {
          setOrders(ordersResult.value);
        } else {
          setError("주문 내역을 불러오지 못했습니다.");
        }
        if (reviewsResult.status === "fulfilled") {
          setReviews(reviewsResult.value);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const findReview = (orderId: string, productId: string): Review | undefined =>
    reviews.find(
      (r) =>
        r.orderId === orderId &&
        (typeof r.productId === "string"
          ? r.productId === productId
          : r.productId._id === productId)
    );

  const handleCancelConfirm = async () => {
    if (!cancelTargetId) return;
    const orderId = cancelTargetId;
    setCancelTargetId(null);
    try {
      await orderService.cancelOrder(orderId);
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? { ...o, status: "cancelled" as const, cancelledAt: new Date().toISOString() }
            : o
        )
      );
      toast.success("주문이 취소되었습니다.");
    } catch {
      toast.error("주문 취소에 실패했습니다.");
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
    <>
    <AlertDialog open={cancelTargetId !== null} onOpenChange={(open) => { if (!open) setCancelTargetId(null); }}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>주문을 취소할까요?</AlertDialogTitle>
          <AlertDialogDescription>
            취소된 주문은 되돌릴 수 없습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>아니요</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleCancelConfirm}>
            취소하기
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {reviewTarget && (
      <ReviewWriteDialog
        open={reviewTarget !== null}
        onOpenChange={(open) => { if (!open) setReviewTarget(null); }}
        productId={reviewTarget.productId}
        productName={reviewTarget.productName}
        orderId={reviewTarget.orderId}
        existingReview={reviewTarget.existingReview}
        onSuccess={(review) => {
          setReviews((prev) => {
            const idx = prev.findIndex((r) => r._id === review._id);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = review;
              return next;
            }
            return [review, ...prev];
          });
          setReviewTarget(null);
        }}
      />
    )}

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
            {order.items.map((item, i) => {
              const thumbnail =
                item.productId && typeof item.productId !== "string"
                  ? item.productId.thumbnail?.[0]
                  : undefined;
              const productId =
                !item.productId || typeof item.productId === "string"
                  ? (item.productId as string)
                  : item.productId._id;
              const existingReview =
                order.status === "delivered"
                  ? findReview(order._id, productId)
                  : undefined;

              return (
                <div key={i} className="flex items-center gap-3 py-2.5">
                  {thumbnail ? (
                    <img
                      src={thumbnail}
                      alt={item.name}
                      className="h-12 w-12 shrink-0 rounded-lg border border-gray-100 object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 shrink-0 rounded-lg border border-gray-100 bg-gray-50" />
                  )}
                  <div className="flex flex-1 items-center justify-between">
                    <p className="text-sm text-gray-700">
                      {item.name}
                      <span className="ml-1 text-gray-400">× {item.quantity}</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-800">
                        {(item.price * item.quantity).toLocaleString()}원
                      </p>
                      {order.status === "delivered" && (
                        <button
                          onClick={() =>
                            setReviewTarget({
                              orderId: order._id,
                              productId,
                              productName: item.name,
                              existingReview,
                            })
                          }
                          className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                            existingReview
                              ? "border-brand-blue/30 text-brand-blue hover:bg-brand-blue/5"
                              : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
                          }`}
                        >
                          {existingReview ? "리뷰 수정" : "리뷰 작성"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
                onClick={() => setCancelTargetId(order._id)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 hover:border-red-200 hover:text-red-500"
              >
                주문 취소
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
    </>
  );
}
