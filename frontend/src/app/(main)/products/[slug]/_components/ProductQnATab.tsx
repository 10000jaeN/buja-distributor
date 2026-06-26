"use client";

import { useEffect, useState } from "react";
import { Lock, MessageCircleQuestion, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { qnaService } from "@/api/qnaService";
import { Qna } from "@/types/qna";
import useAuthStore from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { EmptyState } from "./EmptyState";
import { QnAWriteDialog } from "./QnAWriteDialog";
import { isAdminRole } from "@/lib/authUtils";
import { formatDate } from "@/lib/dateUtils";
import { Spinner } from "@/components/shared/Spinner";

type Props = {
  productId: string;
  productName: string;
};

export function ProductQnATab({ productId, productName }: Props) {
  const { user, isLoggedIn } = useAuthStore();
  const [qnaList, setQnaList] = useState<Qna[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isAdmin = isAdminRole(user?.roles);

  useEffect(() => {
    qnaService
      .getQnaList(productId)
      .then(setQnaList)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [productId]);

  const handleQnaSuccess = (newQna: Qna) => {
    setQnaList((prev) => [newQna, ...prev]);
  };

  const handleDelete = async (qnaId: string) => {
    setDeletingId(qnaId);
    try {
      await qnaService.deleteQna(qnaId);
      setQnaList((prev) => prev.filter((q) => q._id !== qnaId));
      toast.success("문의가 삭제되었습니다.");
    } catch {
      toast.error("삭제에 실패했습니다.");
    } finally {
      setDeletingId(null);
    }
  };

  const canViewContent = (qna: Qna) => {
    if (!qna.isSecret) return true;
    if (isAdmin) return true;
    if (user && qna.userId._id === user.userId) return true;
    return false;
  };

  const canDelete = (qna: Qna) => {
    if (isAdmin) return true;
    if (user && qna.userId._id === user.userId) return true;
    return false;
  };

  return (
    <div className="px-4 py-6 lg:px-0">
      {/* 헤더 */}
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          총 <span className="font-semibold text-gray-800">{qnaList.length}</span>건
        </p>
        {isLoggedIn ? (
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            문의 작성
          </Button>
        ) : (
          <p className="text-xs text-gray-400">문의 작성은 로그인 후 가능합니다.</p>
        )}
      </div>

      {/* 목록 */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="md" />
        </div>
      ) : qnaList.length === 0 ? (
        <EmptyState
          icon={<MessageCircleQuestion className="h-8 w-8 text-gray-300" />}
          title="등록된 문의가 없습니다."
          description="궁금한 점은 문의 작성 버튼을 이용해 주세요."
        />
      ) : (
        <ul className="divide-y divide-gray-100">
          {qnaList.map((qna) => {
            const visible = canViewContent(qna);
            return (
              <li key={qna._id} className="py-4">
                {/* 질문 */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-1.5">
                      {qna.isSecret && (
                        <Lock className="size-3 shrink-0 text-gray-400" />
                      )}
                      <span className="text-xs font-medium text-gray-500">
                        {qna.userId.nickName}
                      </span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">
                        {formatDate(qna.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      {visible ? qna.content : "비밀글입니다."}
                    </p>
                  </div>
                  {canDelete(qna) && (
                    <button
                      type="button"
                      onClick={() => handleDelete(qna._id)}
                      disabled={deletingId === qna._id}
                      className="shrink-0 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500 disabled:opacity-50"
                      aria-label="문의 삭제"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>

                {/* 답변 */}
                {qna.answer && visible && (
                  <div className="mt-3 rounded-lg bg-gray-50 px-4 py-3">
                    <p className="mb-1 text-xs font-semibold text-brand-blue">판매자 답변</p>
                    <p className="text-sm text-gray-700">{qna.answer}</p>
                    {qna.answeredAt && (
                      <p className="mt-1 text-xs text-gray-400">{formatDate(qna.answeredAt)}</p>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <QnAWriteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        productId={productId}
        productName={productName}
        onSuccess={handleQnaSuccess}
      />
    </div>
  );
}
