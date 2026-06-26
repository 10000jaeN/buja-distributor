"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Trash2, Lock, ChevronDown, ChevronUp } from "lucide-react";
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
import { qnaService } from "@/api/qnaService";
import { Qna } from "@/types/qna";

const QNA_LAST_READ_KEY = "qna_last_read";

export default function MyQnaClient() {
  const [qnaList, setQnaList] = useState<Qna[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    localStorage.setItem(QNA_LAST_READ_KEY, new Date().toISOString());

    qnaService
      .getMyQnaList()
      .then(setQnaList)
      .catch(() => setLoadError(true))
      .finally(() => setIsLoading(false));
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    const id = deleteTargetId;
    setDeleteTargetId(null);
    try {
      await qnaService.deleteQna(id);
      setQnaList((prev) => prev.filter((q) => q._id !== id));
      toast.success("문의가 삭제되었습니다.");
    } catch {
      toast.error("문의 삭제에 실패했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-3 border-gray-200 border-t-brand-blue" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-10 text-center shadow-sm">
        <p className="text-sm text-gray-400">문의 목록을 불러오지 못했습니다.</p>
      </div>
    );
  }

  if (qnaList.length === 0) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-10 text-center shadow-sm">
        <p className="text-sm text-gray-400">작성한 문의가 없습니다.</p>
      </div>
    );
  }

  return (
    <>
      <AlertDialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => { if (!open) setDeleteTargetId(null); }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>문의를 삭제할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              삭제된 문의는 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>아니요</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDeleteConfirm}>
              삭제하기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-4">
        {qnaList.map((qna) => {
          const product =
            typeof qna.productId !== "string" ? qna.productId : null;
          const hasAnswer = !!qna.answer;
          const isExpanded = expandedIds.has(qna._id);

          return (
            <div
              key={qna._id}
              className="rounded-xl border border-gray-100 bg-white shadow-sm"
            >
              {/* 헤더 */}
              <div className="flex items-start justify-between gap-3 p-5">
                <div className="min-w-0 flex-1">
                  {product ? (
                    <Link
                      href={`/products/${product.slug}`}
                      className="truncate text-sm font-semibold text-gray-800 hover:text-brand-blue transition-colors"
                    >
                      {product.name}
                    </Link>
                  ) : (
                    <span className="text-sm font-semibold text-gray-800">상품</span>
                  )}
                  <div className="mt-0.5 flex items-center gap-1.5">
                    {qna.isSecret && (
                      <Lock className="size-3 text-gray-400" />
                    )}
                    <span className="text-xs text-gray-400">
                      {new Date(qna.createdAt).toLocaleDateString("ko-KR")}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        hasAnswer
                          ? "bg-blue-50 text-brand-blue"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {hasAnswer ? "답변완료" : "답변대기"}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {hasAnswer && (
                    <button
                      type="button"
                      onClick={() => toggleExpand(qna._id)}
                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
                      aria-label={isExpanded ? "답변 접기" : "답변 보기"}
                    >
                      {isExpanded ? (
                        <ChevronUp className="size-4" />
                      ) : (
                        <ChevronDown className="size-4" />
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setDeleteTargetId(qna._id)}
                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    aria-label="문의 삭제"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              {/* 문의 내용 */}
              <div className="border-t border-gray-100 px-5 py-4">
                <p className="whitespace-pre-wrap text-sm text-gray-700">
                  {qna.content}
                </p>
              </div>

              {/* 답변 (펼쳤을 때) */}
              {hasAnswer && isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50 px-5 py-4 rounded-b-xl">
                  <p className="mb-1.5 text-xs font-semibold text-brand-blue">판매자 답변</p>
                  <p className="whitespace-pre-wrap text-sm text-gray-700">{qna.answer}</p>
                  {qna.answeredAt && (
                    <p className="mt-2 text-xs text-gray-400">
                      {new Date(qna.answeredAt).toLocaleDateString("ko-KR")}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
