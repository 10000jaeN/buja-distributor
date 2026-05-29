"use client";

import { Order, OrderStatus, getProductId } from "@/api/orderService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Link from "next/link";
import { useState, useEffect } from "react";

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

const NEXT_STATUSES: Partial<Record<OrderStatus, OrderStatus[]>> = {
  paid: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
};

interface Props {
  order: Order | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSave: (params: {
    newStatus: OrderStatus;
    courierName: string;
    trackingNumber: string;
  }) => void;
}

export default function OrderEditDialog({
  order,
  isSubmitting,
  onClose,
  onSave,
}: Props) {
  const [editStatus, setEditStatus] = useState<OrderStatus | "">("");
  const [editCourier, setEditCourier] = useState("");
  const [editTracking, setEditTracking] = useState("");

  useEffect(() => {
    if (order) {
      setEditStatus("");
      setEditCourier(order.courierName ?? "");
      setEditTracking(order.trackingNumber ?? "");
    }
  }, [order]);

  const resolvedStatus = editStatus || order?.status;
  const showTrackingFields =
    resolvedStatus === "shipped" || resolvedStatus === "processing";

  const handleSave = () => {
    if (!order) return;
    onSave({
      newStatus: (editStatus || order.status) as OrderStatus,
      courierName: editCourier,
      trackingNumber: editTracking,
    });
  };

  return (
    <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>주문 수정</DialogTitle>
          {order && (
            <p className="font-mono text-sm text-gray-500">
              {order.orderNumber}
            </p>
          )}
        </DialogHeader>

        {order && (
          <div className="space-y-5">
            {/* 주문 요약 */}
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-sm font-medium text-gray-800">
                {order.user?.nickName ?? "-"}
              </p>
              <div className="mt-1 flex flex-wrap gap-x-1 gap-y-0.5">
                {order.items.map((item, i) => (
                  <Link
                    key={i}
                    href={`/products/${getProductId(item)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand-blue text-xs text-gray-500 hover:underline"
                  >
                    {item.name}
                    {i < order.items.length - 1 && (
                      <span className="ml-1 text-gray-300">·</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* 상태 변경 */}
            <div className="flex items-center justify-between">
              <p className="mb-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                주문상태 변경
              </p>
              {NEXT_STATUSES[order.status] ? (
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLOR[order.status]}`}
                  >
                    {STATUS_LABEL[order.status]}
                  </span>
                  <span className="text-gray-300">→</span>
                  <Select
                    value={editStatus}
                    onValueChange={(v) => setEditStatus(v as OrderStatus)}
                  >
                    <SelectTrigger className="w-35">
                      <SelectValue placeholder="변경할 상태 선택">
                        {editStatus ? STATUS_LABEL[editStatus] : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {NEXT_STATUSES[order.status]!.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  현재 상태에서 변경할 수 없습니다.
                </p>
              )}
            </div>

            {/* 송장 정보 */}
            {showTrackingFields && (
              <div>
                <p className="mb-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                  송장 정보
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1.5 block text-xs text-gray-500">
                      택배사
                    </label>
                    <Input
                      placeholder="예: CJ대한통운, 우체국택배"
                      value={editCourier}
                      onChange={(e) => setEditCourier(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs text-gray-500">
                      운송장 번호
                    </label>
                    <Input
                      placeholder="운송장 번호 입력"
                      value={editTracking}
                      onChange={(e) => setEditTracking(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? "저장 중..." : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
