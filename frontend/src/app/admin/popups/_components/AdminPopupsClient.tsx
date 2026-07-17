"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { popupService, Popup, PopupFormData } from "@/api/popupService";
import PopupFormDialog from "./PopupFormDialog";

function formatDate(iso: string | null) {
  if (!iso) return "무기한";
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminPopupsClient() {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Popup | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Popup | null>(null);

  const fetchPopups = useCallback(async () => {
    setIsLoading(true);
    try {
      setPopups(await popupService.getAll());
    } catch {
      toast.error("팝업 목록을 불러오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchPopups(); }, [fetchPopups]);

  const handleSubmit = async (data: PopupFormData) => {
    setIsSubmitting(true);
    try {
      if (editTarget) {
        await popupService.update(editTarget._id, data);
        toast.success("팝업이 수정됐습니다.");
      } else {
        await popupService.create(data);
        toast.success("팝업이 생성됐습니다.");
      }
      setDialogOpen(false);
      setEditTarget(null);
      fetchPopups();
    } catch {
      toast.error("저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await popupService.delete(deleteTarget._id);
      toast.success("팝업이 삭제됐습니다.");
      setDeleteTarget(null);
      fetchPopups();
    } catch {
      toast.error("삭제에 실패했습니다.");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-800">팝업 관리</h1>
        <Button
          size="sm"
          onClick={() => { setEditTarget(null); setDialogOpen(true); }}
        >
          <Plus className="mr-1.5 h-4 w-4" /> 팝업 추가
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-brand-blue" />
        </div>
      ) : popups.length === 0 ? (
        <div className="rounded-xl border border-gray-100 py-16 text-center text-sm text-gray-400">
          등록된 팝업이 없습니다.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500">
              <tr>
                <th className="px-4 py-3">미리보기</th>
                <th className="px-4 py-3">제목</th>
                <th className="px-4 py-3">액션</th>
                <th className="px-4 py-3">노출 기간</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {popups.map((popup) => {
                const now = new Date();
                const started = !popup.startDate || new Date(popup.startDate) <= now;
                const notEnded = !popup.endDate || new Date(popup.endDate) >= now;
                const isLive = popup.isActive && started && notEnded;

                return (
                  <tr key={popup._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Image
                        src={popup.imageUrl}
                        alt={popup.title}
                        width={56}
                        height={56}
                        className="h-14 w-14 rounded-lg object-cover"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{popup.title}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {popup.couponCode
                        ? `쿠폰: ${popup.couponCode}`
                        : popup.linkUrl
                        ? "링크 이동"
                        : "없음"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      <div>{formatDate(popup.startDate)}</div>
                      <div className="text-gray-400">~ {formatDate(popup.endDate)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          isLive
                            ? "bg-green-50 text-green-600"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {isLive ? "노출 중" : popup.isActive ? "대기" : "비활성"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => { setEditTarget(popup); setDialogOpen(true); }}
                          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(popup)}
                          className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
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

      <PopupFormDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditTarget(null); }}
        onSubmit={handleSubmit}
        initial={editTarget}
        isSubmitting={isSubmitting}
      />

      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-gray-800">팝업 삭제</h3>
            <p className="mt-2 text-sm text-gray-500">
              <span className="font-medium text-gray-700">&ldquo;{deleteTarget.title}&rdquo;</span> 팝업을 삭제할까요?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>취소</Button>
              <Button variant="destructive" onClick={handleDelete}>삭제</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
