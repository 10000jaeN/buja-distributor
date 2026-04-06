"use client";

import { orderService, Order, OrderStatus } from "@/api/orderService";
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
import { RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import OrderDetailDialog from "./_components/OrderDetailDialog";
import OrderEditDialog from "./_components/OrderEditDialog";

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

const ALL_STATUSES: OrderStatus[] = [
  "pending", "paid", "processing", "shipped", "delivered", "cancelled",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [detailTarget, setDetailTarget] = useState<Order | null>(null);
  const [editTarget, setEditTarget] = useState<Order | null>(null);

  // 일괄 배송 시작 다이얼로그
  const [bulkShipOpen, setBulkShipOpen] = useState(false);
  const [bulkCourier, setBulkCourier] = useState("");
  const [bulkTracking, setBulkTracking] = useState("");

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await orderService.getAllOrders();
      setOrders(data);
      setSelectedIds(new Set());
    } catch {
      setError("주문 목록을 불러오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleSave = async ({
    newStatus,
    courierName,
    trackingNumber,
  }: {
    newStatus: OrderStatus;
    courierName: string;
    trackingNumber: string;
  }) => {
    if (!editTarget) return;
    if (newStatus === "shipped" && (!courierName.trim() || !trackingNumber.trim())) {
      toast.error("배송 중으로 변경하려면 택배사와 운송장 번호가 필요합니다.");
      return;
    }
    setIsSubmitting(true);
    try {
      if (newStatus === editTarget.status) {
        if (
          editTarget.status === "processing" &&
          (courierName !== editTarget.courierName || trackingNumber !== editTarget.trackingNumber)
        ) {
          await orderService.startShipping(editTarget._id, courierName, trackingNumber);
          toast.success("송장 정보가 저장되고 배송 시작으로 변경됐습니다.");
        } else {
          toast("변경 사항이 없습니다.");
          setEditTarget(null);
          return;
        }
      } else {
        switch (newStatus) {
          case "processing": await orderService.startPreparation(editTarget._id); break;
          case "shipped": await orderService.startShipping(editTarget._id, courierName, trackingNumber); break;
          case "delivered": await orderService.completeDelivery(editTarget._id); break;
          case "cancelled": await orderService.cancelOrder(editTarget._id); break;
        }
        toast.success(`주문 ${editTarget.orderNumber} 상태를 "${STATUS_LABEL[newStatus]}"로 변경했습니다.`);
      }
      setEditTarget(null);
      await fetchOrders();
    } catch {
      toast.error("처리에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── 일괄 처리 ────────────────────────────────────────────────
  const selectedOrders = filteredOrders_ref(orders, searchQuery, filterStatus).filter(
    (o) => selectedIds.has(o._id),
  );

  const allPaid       = selectedOrders.length > 0 && selectedOrders.every((o) => o.status === "paid");
  const allProcessing = selectedOrders.length > 0 && selectedOrders.every((o) => o.status === "processing");
  const allShipped    = selectedOrders.length > 0 && selectedOrders.every((o) => o.status === "shipped");
  const allCancellable =
    selectedOrders.length > 0 &&
    selectedOrders.every((o) => ["pending", "paid", "processing"].includes(o.status));

  const handleBulkPrepare = async () => {
    setIsSubmitting(true);
    try {
      await Promise.all(selectedOrders.map((o) => orderService.startPreparation(o._id)));
      toast.success(`${selectedOrders.length}건 상품 준비 시작으로 변경했습니다.`);
      await fetchOrders();
    } catch { toast.error("처리에 실패했습니다."); }
    finally { setIsSubmitting(false); }
  };

  const handleBulkShip = async () => {
    if (!bulkCourier.trim() || !bulkTracking.trim()) {
      toast.error("택배사와 운송장 번호를 입력해주세요.");
      return;
    }
    setIsSubmitting(true);
    try {
      await Promise.all(
        selectedOrders.map((o) => orderService.startShipping(o._id, bulkCourier, bulkTracking)),
      );
      toast.success(`${selectedOrders.length}건 배송 시작으로 변경했습니다.`);
      setBulkShipOpen(false);
      await fetchOrders();
    } catch { toast.error("처리에 실패했습니다."); }
    finally { setIsSubmitting(false); }
  };

  const handleBulkComplete = async () => {
    setIsSubmitting(true);
    try {
      await Promise.all(selectedOrders.map((o) => orderService.completeDelivery(o._id)));
      toast.success(`${selectedOrders.length}건 배송 완료 처리했습니다.`);
      await fetchOrders();
    } catch { toast.error("처리에 실패했습니다."); }
    finally { setIsSubmitting(false); }
  };

  const handleBulkCancel = async () => {
    setIsSubmitting(true);
    try {
      await Promise.all(selectedOrders.map((o) => orderService.cancelOrder(o._id)));
      toast.success(`${selectedOrders.length}건 취소했습니다.`);
      await fetchOrders();
    } catch { toast.error("처리에 실패했습니다."); }
    finally { setIsSubmitting(false); }
  };

  // ── 체크박스 ─────────────────────────────────────────────────
  const filteredOrders = filteredOrders_ref(orders, searchQuery, filterStatus);
  const allChecked =
    filteredOrders.length > 0 && filteredOrders.every((o) => selectedIds.has(o._id));
  const someChecked = filteredOrders.some((o) => selectedIds.has(o._id));

  const toggleAll = () => {
    if (allChecked) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredOrders.forEach((o) => next.delete(o._id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredOrders.forEach((o) => next.add(o._id));
        return next;
      });
    }
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  };

  const statusCounts = ALL_STATUSES.reduce(
    (acc, s) => ({ ...acc, [s]: orders.filter((o) => o.status === s).length }),
    {} as Record<OrderStatus, number>,
  );

  return (
    <>
      {/* 페이지 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-foreground text-xl font-bold">주문 관리</h1>
        <Button variant="outline" onClick={fetchOrders} disabled={isLoading}>
          <RotateCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          새로고침
        </Button>
      </div>

      {/* 스탯 카드 */}
      {!isLoading && !error && (
        <div className="mb-6 grid grid-cols-3 gap-3 lg:grid-cols-6">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? "all" : s)}
              className={`hover:border-brand-blue rounded-lg border bg-white px-4 py-3 text-left shadow-sm transition-colors ${filterStatus === s ? "border-brand-blue" : "border-gray-200"}`}
            >
              <p className="text-xs font-medium text-gray-500">{STATUS_LABEL[s]}</p>
              <p className={`mt-1 text-2xl font-bold ${filterStatus === s ? "text-brand-blue" : "text-foreground"}`}>
                {statusCounts[s]}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* 검색 및 필터 */}
      {!isLoading && !error && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="주문번호 / 주문자 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-white"
          />
          <Select value={filterStatus} onValueChange={(v) => v && setFilterStatus(v)}>
            <SelectTrigger className="bg-white sm:w-44">
              <SelectValue>
                {filterStatus === "all" ? "전체 상태" : STATUS_LABEL[filterStatus as OrderStatus]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 상태</SelectItem>
              {ALL_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            onClick={() => { setSearchQuery(""); setFilterStatus("all"); }}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            초기화
          </button>
        </div>
      )}

      {/* 일괄 처리 액션 바 */}
      {selectedIds.size > 0 && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-brand-blue/30 bg-blue-50 px-4 py-2.5">
          <span className="text-sm font-medium text-brand-blue">
            {selectedIds.size}건 선택됨
          </span>
          <div className="ml-auto flex flex-wrap gap-2">
            {allPaid && (
              <Button size="sm" variant="outline" disabled={isSubmitting} onClick={handleBulkPrepare} className="text-xs">
                준비 시작
              </Button>
            )}
            {allProcessing && (
              <Button size="sm" variant="outline" disabled={isSubmitting} onClick={() => { setBulkCourier(""); setBulkTracking(""); setBulkShipOpen(true); }} className="text-xs">
                배송 시작
              </Button>
            )}
            {allShipped && (
              <Button size="sm" variant="outline" disabled={isSubmitting} onClick={handleBulkComplete} className="text-xs">
                배송 완료
              </Button>
            )}
            {allCancellable && (
              <Button size="sm" variant="outline" disabled={isSubmitting} onClick={handleBulkCancel} className="border-red-200 text-xs text-red-500 hover:bg-red-50">
                취소
              </Button>
            )}
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              선택 해제
            </button>
          </div>
        </div>
      )}

      {/* 주문 테이블 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="border-t-brand-blue h-8 w-8 animate-spin rounded-full border-3 border-gray-200" />
            <span className="text-sm text-gray-500">불러오는 중...</span>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-10 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <Button variant="outline" onClick={fetchOrders} className="mt-3 border-red-300 text-red-600 hover:bg-red-100">
            다시 시도
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={(el) => { if (el) el.indeterminate = someChecked && !allChecked; }}
                    onChange={toggleAll}
                    className="accent-brand-blue h-4 w-4 cursor-pointer rounded"
                  />
                </th>
                {["주문번호", "주문자", "상품", "금액", "상태", "주문일", "관리"].map((col, i) => (
                  <th key={i} className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-gray-400">
                    {orders.length === 0 ? "주문 내역이 없습니다." : "검색 결과가 없습니다."}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order._id}
                    className={`transition-colors hover:bg-gray-50 ${selectedIds.has(order._id) ? "bg-blue-50/40" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(order._id)}
                        onChange={() => toggleOne(order._id)}
                        className="accent-brand-blue h-4 w-4 cursor-pointer rounded"
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-sm font-medium text-gray-800">
                      {order.orderNumber ?? "Unknown"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div>{order.user?.userName ?? "Unknown"}</div>
                      <div className="text-xs text-gray-400">{order.user?.email ?? ""}</div>
                    </td>
                    <td className="max-w-48 px-4 py-3 text-sm text-gray-700">
                      <div className="truncate">{order.items[0]?.name ?? "-"}</div>
                      {order.items.length > 1 && (
                        <div className="text-xs text-gray-400">외 {order.items.length - 1}건</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {order.totalAmount.toLocaleString()}원
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[order.status]}`}>
                        {STATUS_LABEL[order.status]}
                      </span>
                      {order.trackingNumber && (
                        <div className="mt-1 text-xs text-gray-400">
                          {order.courierName} {order.trackingNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => setDetailTarget(order)} className="text-xs">
                          상세
                        </Button>
                        {!["delivered", "cancelled"].includes(order.status) && (
                          <Button size="sm" variant="outline" onClick={() => setEditTarget(order)} className="text-xs">
                            수정
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 일괄 배송 시작 다이얼로그 */}
      <Dialog open={bulkShipOpen} onOpenChange={(open) => !open && setBulkShipOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>일괄 배송 시작 ({selectedIds.size}건)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-500">선택한 모든 주문에 동일한 송장 정보가 적용됩니다.</p>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">택배사</label>
              <Input placeholder="예: CJ대한통운, 우체국택배" value={bulkCourier} onChange={(e) => setBulkCourier(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">운송장 번호</label>
              <Input placeholder="운송장 번호 입력" value={bulkTracking} onChange={(e) => setBulkTracking(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkShipOpen(false)}>취소</Button>
            <Button onClick={handleBulkShip} disabled={isSubmitting}>배송 시작</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <OrderDetailDialog
        order={detailTarget}
        onClose={() => setDetailTarget(null)}
        onEdit={(order) => setEditTarget(order)}
      />
      <OrderEditDialog
        order={editTarget}
        isSubmitting={isSubmitting}
        onClose={() => setEditTarget(null)}
        onSave={handleSave}
      />
    </>
  );
}

function filteredOrders_ref(orders: Order[], searchQuery: string, filterStatus: string) {
  return orders.filter((o) => {
    const matchSearch =
      (o.orderNumber ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.user?.userName ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.user?.email ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    return matchSearch && matchStatus;
  });
}
