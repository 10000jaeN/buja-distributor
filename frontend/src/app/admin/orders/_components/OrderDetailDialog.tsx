"use client";

import { Order, OrderStatus, getProductId } from "@/api/orderService";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "결제 대기",
  paid: "결제 완료",
  processing: "상품 준비 중",
  shipped: "배송 중",
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

function fmt(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="w-14 shrink-0 text-[11px] text-gray-400">{label}</span>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  );
}

interface Props {
  order: Order | null;
  onClose: () => void;
  onEdit: (order: Order) => void;
}

export default function OrderDetailDialog({ order, onClose, onEdit }: Props) {
  const timeline = order
    ? [
        { label: "주문", date: order.createdAt },
        { label: "결제", date: order.paidAt },
        { label: "배송 시작", date: order.shippedAt },
        { label: "배송 완료", date: order.deliveredAt },
        { label: "취소", date: order.cancelledAt },
      ].filter((t) => !!t.date)
    : [];

  return (
    <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl" showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="font-mono text-base font-bold">
                {order?.orderNumber}
              </DialogTitle>
              {order && (
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLOR[order.status]}`}
                >
                  {STATUS_LABEL[order.status]}
                </span>
              )}
            </div>
            {order && (
              <span className="text-brand-blue text-lg font-bold tabular-nums">
                {order.totalAmount.toLocaleString()}원
              </span>
            )}
          </div>
        </DialogHeader>

        {order && (
          <div className="-mx-6 -mb-4 grid grid-cols-[5fr_7fr] divide-x divide-gray-100 border-t border-gray-100">
            {/* 좌: 주문자 · 배송지 · 송장 */}
            <div className="space-y-5 px-6 py-4">
              <section>
                <p className="mb-2 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                  주문자
                </p>
                <div className="space-y-1.5">
                  <InfoRow
                    label="이름"
                    value={
                      <span className="font-medium">
                        {order.user?.nickName ?? "-"}
                      </span>
                    }
                  />
                  <InfoRow label="이메일" value={order.user?.email ?? "-"} />
                </div>
              </section>

              {order.shippingAddress && (
                <section>
                  <p className="mb-2 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                    배송지
                  </p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800">
                        {order.shippingAddress.recipientName}
                      </span>
                      <span className="text-xs text-gray-400">
                        {order.shippingAddress.phoneNumber}
                      </span>
                    </div>
                    <p className="text-sm leading-snug text-gray-600">
                      ({order.shippingAddress.zipCode}){" "}
                      {order.shippingAddress.mainAddress}
                      {order.shippingAddress.detailAddress && (
                        <span className="text-gray-500">
                          {" "}
                          {order.shippingAddress.detailAddress}
                        </span>
                      )}
                    </p>
                  </div>
                </section>
              )}

              {order.trackingNumber && (
                <section>
                  <p className="mb-2 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                    송장 정보
                  </p>
                  <div className="space-y-1.5">
                    <InfoRow label="택배사" value={order.courierName ?? "-"} />
                    <InfoRow
                      label="운송장"
                      value={
                        <span className="font-mono">
                          {order.trackingNumber}
                        </span>
                      }
                    />
                  </div>
                </section>
              )}
            </div>

            {/* 우: 주문 상품 */}
            <div className="mb-4">
              <div className="max-h-50 overflow-y-auto py-4">
                <p className="mb-3 px-6 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                  주문 상품 ({order.items.length}종)
                </p>
                <div className="space-y-2 px-6">
                  {order.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <Link
                          href={`/products/${getProductId(item)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-brand-blue block truncate text-sm font-medium text-gray-800 hover:underline"
                        >
                          {item.name}
                        </Link>
                        <p className="text-xs text-gray-400">
                          {item.price.toLocaleString()}원 × {item.quantity}개
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-gray-700 tabular-nums">
                        {(item.price * item.quantity).toLocaleString()}원
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5 border-t border-gray-100 px-6 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">상품 소계</span>
                  <span className="text-sm text-gray-600 tabular-nums">
                    {order.items
                      .reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0,
                      )
                      .toLocaleString()}
                    원
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">배송비</span>
                  <span className="text-sm text-gray-600 tabular-nums">
                    {(order.shippingFee ?? 0) === 0
                      ? "무료"
                      : `${(order.shippingFee ?? 0).toLocaleString()}원`}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 px-6 pt-3">
                <span className="text-sm font-medium text-gray-500">합계</span>
                <span className="text-brand-blue text-base font-bold tabular-nums">
                  {order.totalAmount.toLocaleString()}원
                </span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="sm:justify-between">
          {/* 타임라인 */}
          <div className="flex flex-wrap items-center gap-1">
            {timeline.map((t, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className="bg-brand-blue/40 size-1.5 shrink-0 rounded-full" />
                <span className="text-[11px] text-gray-400">{t.label}</span>
                <span className="text-[11px] font-medium text-gray-500 tabular-nums">
                  {fmt(t.date)}
                </span>
                {i < timeline.length - 1 && (
                  <span className="ml-1 text-gray-200">·</span>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              닫기
            </Button>
            {order && !["delivered", "cancelled"].includes(order.status) && (
              <Button
                onClick={() => {
                  onClose();
                  onEdit(order);
                }}
              >
                수정
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
