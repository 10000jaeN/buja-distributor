"use client";

import { orderService, Order, OrderStatus } from "@/api/orderService";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import OrderDetailDialog from "./_components/OrderDetailDialog";
import OrderEditDialog from "./_components/OrderEditDialog";
import OrderStatusCards from "./_components/OrderStatusCards";
import OrderSearchBar from "./_components/OrderSearchBar";
import OrderBulkActionBar from "./_components/OrderBulkActionBar";
import OrderCardList from "./_components/OrderCardList";
import OrderTable from "./_components/OrderTable";
import BulkShipDialog from "./_components/BulkShipDialog";
import { ALL_STATUSES, STATUS_LABEL, filterOrders } from "./_utils/orderUtils";
import { DateRange } from "react-day-picker";

const PAGE_SIZE = 20;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [detailTarget, setDetailTarget] = useState<Order | null>(null);
  const [editTarget, setEditTarget] = useState<Order | null>(null);

  const [bulkShipOpen, setBulkShipOpen] = useState(false);
  const [bulkCourier, setBulkCourier] = useState("");
  const [bulkTracking, setBulkTracking] = useState("");
  const [bulkCancelOpen, setBulkCancelOpen] = useState(false);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchOrders = useCallback(async () => {
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
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [searchQuery, filterStatus, dateRange]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) setVisibleCount((p) => p + PAGE_SIZE); },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ── 단건 수정 ─────────────────────────────────────────────────
  const handleSave = async ({ newStatus, courierName, trackingNumber }: {
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
        if (editTarget.status === "processing" &&
          (courierName !== editTarget.courierName || trackingNumber !== editTarget.trackingNumber)) {
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

  // ── 일괄 처리 ─────────────────────────────────────────────────
  const runBulk = async (fn: (id: string) => Promise<unknown>, successMsg: string) => {
    setIsSubmitting(true);
    try {
      const results = await Promise.allSettled(selectedOrders.map((o) => fn(o._id)));
      const failedOrders = selectedOrders.filter((_, i) => results[i].status === "rejected");
      const succeeded = results.length - failedOrders.length;
      if (failedOrders.length === 0) {
        toast.success(`${succeeded}건 ${successMsg}.`);
      } else {
        const failedNums = failedOrders.map((o) => o.orderNumber).join(", ");
        toast.error(`${succeeded}건 성공, ${failedOrders.length}건 실패 (${failedNums})`);
      }
      await fetchOrders();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkShip = async () => {
    if (!bulkCourier.trim() || !bulkTracking.trim()) {
      toast.error("택배사와 운송장 번호를 입력해주세요.");
      return;
    }
    await runBulk((id) => orderService.startShipping(id, bulkCourier, bulkTracking), "배송 시작으로 변경했습니다");
    setBulkShipOpen(false);
  };

  // ── 필터링 / 체크박스 ─────────────────────────────────────────
  const filteredOrders = filterOrders(orders, searchQuery, filterStatus, dateRange);
  const visibleOrders = filteredOrders.slice(0, visibleCount);
  const hasMore = visibleCount < filteredOrders.length;
  const selectedOrders = filteredOrders.filter((o) => selectedIds.has(o._id));

  const allChecked = filteredOrders.length > 0 && filteredOrders.every((o) => selectedIds.has(o._id));
  const someChecked = filteredOrders.some((o) => selectedIds.has(o._id));

  const toggleAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allChecked) filteredOrders.forEach((o) => next.delete(o._id));
      else filteredOrders.forEach((o) => next.add(o._id));
      return next;
    });
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const statusCounts = ALL_STATUSES.reduce(
    (acc, s) => ({ ...acc, [s]: orders.filter((o) => o.status === s).length }),
    {} as Record<OrderStatus, number>,
  );

  const allPaid = selectedOrders.length > 0 && selectedOrders.every((o) => o.status === "paid");
  const allProcessing = selectedOrders.length > 0 && selectedOrders.every((o) => o.status === "processing");
  const allShipped = selectedOrders.length > 0 && selectedOrders.every((o) => o.status === "shipped");
  const allCancellable = selectedOrders.length > 0 &&
    selectedOrders.every((o) => ["pending", "paid", "processing"].includes(o.status));

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-foreground text-xl font-bold">주문 관리</h1>
        <Button variant="outline" onClick={fetchOrders} disabled={isLoading}>
          <RotateCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          새로고침
        </Button>
      </div>

      {!isLoading && !error && (
        <>
          <OrderStatusCards
            statusCounts={statusCounts}
            filterStatus={filterStatus}
            onFilter={setFilterStatus}
          />
          <OrderSearchBar
            searchQuery={searchQuery}
            filterStatus={filterStatus}
            dateRange={dateRange}
            resultCount={filteredOrders.length}
            onSearchChange={setSearchQuery}
            onStatusChange={setFilterStatus}
            onDateRangeChange={setDateRange}
            onReset={() => { setSearchQuery(""); setFilterStatus("all"); setDateRange(undefined); }}
          />
        </>
      )}

      {selectedIds.size > 0 && (
        <OrderBulkActionBar
          count={selectedIds.size}
          allPaid={allPaid}
          allProcessing={allProcessing}
          allShipped={allShipped}
          allCancellable={allCancellable}
          isSubmitting={isSubmitting}
          onPrepare={() => runBulk((id) => orderService.startPreparation(id), "상품 준비 시작으로 변경했습니다")}
          onShipOpen={() => { setBulkCourier(""); setBulkTracking(""); setBulkShipOpen(true); }}
          onComplete={() => runBulk((id) => orderService.completeDelivery(id), "배송 완료 처리했습니다")}
          onCancelOpen={() => setBulkCancelOpen(true)}
          onDeselect={() => setSelectedIds(new Set())}
        />
      )}

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
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white py-12 text-center text-sm text-gray-400 shadow-sm">
          {orders.length === 0 ? "주문 내역이 없습니다." : "검색 결과가 없습니다."}
        </div>
      ) : (
        <>
          <OrderCardList
            orders={visibleOrders}
            selectedIds={selectedIds}
            onToggleOne={toggleOne}
            onDetail={setDetailTarget}
            onEdit={setEditTarget}
          />
          <OrderTable
            orders={visibleOrders}
            selectedIds={selectedIds}
            allChecked={allChecked}
            someChecked={someChecked}
            onToggleAll={toggleAll}
            onToggleOne={toggleOne}
            onDetail={setDetailTarget}
            onEdit={setEditTarget}
          />
        </>
      )}

      <div ref={sentinelRef} className="py-4 text-center">
        {hasMore && (
          <div className="border-t-brand-blue mx-auto h-5 w-5 animate-spin rounded-full border-2 border-gray-200" />
        )}
      </div>

      <BulkShipDialog
        open={bulkShipOpen}
        count={selectedIds.size}
        courier={bulkCourier}
        tracking={bulkTracking}
        isSubmitting={isSubmitting}
        onCourierChange={setBulkCourier}
        onTrackingChange={setBulkTracking}
        onConfirm={handleBulkShip}
        onClose={() => setBulkShipOpen(false)}
      />

      <ConfirmDialog
        open={bulkCancelOpen}
        onOpenChange={(open) => { if (!open) setBulkCancelOpen(false); }}
        title="주문 취소 확인"
        description={`선택한 ${selectedIds.size}건의 주문을 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmLabel="취소 확정"
        onConfirm={() => {
          setBulkCancelOpen(false);
          runBulk((id) => orderService.cancelOrder(id), "취소했습니다");
        }}
      />

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
