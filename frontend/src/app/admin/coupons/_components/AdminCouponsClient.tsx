"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { couponService, Coupon, CouponFormData } from "@/api/couponService";
import CouponFormDialog from "./CouponFormDialog";

function formatDate(iso: string | null) {
  if (!iso) return "무기한";
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function AdminCouponsClient() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Coupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);

  const fetchCoupons = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await couponService.getAll();
      setCoupons(data);
    } catch {
      toast.error("쿠폰 목록을 불러오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleCreate = () => {
    setEditTarget(null);
    setDialogOpen(true);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditTarget(coupon);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: CouponFormData) => {
    setIsSubmitting(true);
    try {
      if (editTarget) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { code, ...updateData } = data;
        await couponService.update(editTarget._id, updateData);
        toast.success("쿠폰이 수정됐습니다.");
      } else {
        await couponService.create(data);
        toast.success("쿠폰이 생성됐습니다.");
      }
      setDialogOpen(false);
      fetchCoupons();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "저장에 실패했습니다.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      await couponService.delete(deleteTarget._id);
      toast.success("쿠폰이 삭제됐습니다.");
      setDeleteTarget(null);
      fetchCoupons();
    } catch {
      toast.error("삭제에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">쿠폰 관리</h1>
        <Button onClick={handleCreate} className="flex items-center gap-1.5">
          <Plus className="size-4" />
          쿠폰 생성
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-brand-blue" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">
          등록된 쿠폰이 없습니다.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">코드</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">쿠폰명</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">할인</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">사용 현황</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">만료일</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">상태</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map((c) => {
                const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
                const exhausted = c.maxUses !== null && c.usedCount >= c.maxUses;
                const statusLabel = !c.isActive
                  ? "비활성"
                  : expired
                    ? "만료"
                    : exhausted
                      ? "소진"
                      : "사용가능";
                const statusColor = !c.isActive
                  ? "bg-gray-100 text-gray-500"
                  : expired || exhausted
                    ? "bg-red-50 text-red-500"
                    : "bg-green-50 text-green-600";

                return (
                  <tr key={c._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-semibold text-brand-blue">{c.code}</td>
                    <td className="px-4 py-3 text-gray-800">{c.name}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {c.type === "percentage"
                        ? `${c.value}%${c.maxDiscount ? ` (최대 ${c.maxDiscount.toLocaleString()}원)` : ""}`
                        : `${c.value.toLocaleString()}원`}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {c.usedCount.toLocaleString()}
                      {c.maxUses !== null ? ` / ${c.maxUses.toLocaleString()}` : ""}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(c.expiresAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(c)}
                          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(c)}
                          className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <CouponFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        initial={editTarget}
        isSubmitting={isSubmitting}
      />

      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-base font-semibold text-gray-800">쿠폰 삭제</h2>
            <p className="mt-2 text-sm text-gray-500">
              <span className="font-medium text-gray-700">{deleteTarget.code}</span> 쿠폰을 삭제하시겠습니까?
              {deleteTarget.usedCount > 0 && (
                <span className="mt-1 block text-xs text-red-500">
                  이미 {deleteTarget.usedCount}회 사용된 쿠폰입니다. 삭제 시 주문 취소 롤백에 영향을 줄 수 있습니다.
                </span>
              )}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isSubmitting}>
                취소
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? "삭제 중..." : "삭제"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
