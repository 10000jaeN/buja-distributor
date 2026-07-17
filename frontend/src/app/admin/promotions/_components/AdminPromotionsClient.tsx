"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { promotionService, Promotion, PromotionFormData } from "@/api/promotionService";
import PromotionFormDialog from "./PromotionFormDialog";

const TARGET_LABEL: Record<string, string> = {
  all: "전체",
  product: "상품",
  category: "카테고리",
};

const TYPE_LABEL: Record<string, string> = {
  percentage: "정률",
  fixed: "정액",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function AdminPromotionsClient() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Promotion | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null);

  const fetchPromotions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await promotionService.getAll();
      setPromotions(data);
    } catch {
      toast.error("프로모션 목록을 불러오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const handleCreate = () => {
    setEditTarget(null);
    setDialogOpen(true);
  };

  const handleEdit = (promotion: Promotion) => {
    setEditTarget(promotion);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: PromotionFormData) => {
    setIsSubmitting(true);
    try {
      if (editTarget) {
        await promotionService.update(editTarget._id, data);
        toast.success("프로모션이 수정됐습니다.");
      } else {
        await promotionService.create(data);
        toast.success("프로모션이 생성됐습니다.");
      }
      setDialogOpen(false);
      fetchPromotions();
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
      await promotionService.delete(deleteTarget._id);
      toast.success("프로모션이 삭제됐습니다.");
      setDeleteTarget(null);
      fetchPromotions();
    } catch {
      toast.error("삭제에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">프로모션 관리</h1>
        <Button onClick={handleCreate} className="flex items-center gap-1.5">
          <Plus className="size-4" />
          프로모션 생성
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-brand-blue" />
        </div>
      ) : promotions.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">
          등록된 프로모션이 없습니다.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">프로모션명</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">유형</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">할인</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">대상</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">기간</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">상태</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {promotions.map((p) => {
                const now = new Date();
                const started = new Date(p.startDate) <= now;
                const ended = new Date(p.endDate) < now;
                const statusLabel = !p.isActive
                  ? "비활성"
                  : ended
                    ? "종료됨"
                    : started
                      ? "진행중"
                      : "예정";
                const statusColor = !p.isActive
                  ? "bg-gray-100 text-gray-500"
                  : ended
                    ? "bg-red-50 text-red-500"
                    : started
                      ? "bg-green-50 text-green-600"
                      : "bg-blue-50 text-brand-blue";

                return (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                    <td className="px-4 py-3 text-gray-600">{TYPE_LABEL[p.type]}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {p.type === "percentage" ? `${p.value}%` : `${p.value.toLocaleString()}원`}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{TARGET_LABEL[p.target]}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {formatDate(p.startDate)} ~ {formatDate(p.endDate)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(p)}
                          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(p)}
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

      <PromotionFormDialog
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
            <h2 className="text-base font-semibold text-gray-800">프로모션 삭제</h2>
            <p className="mt-2 text-sm text-gray-500">
              <span className="font-medium text-gray-700">{deleteTarget.name}</span> 프로모션을 삭제하시겠습니까?
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
