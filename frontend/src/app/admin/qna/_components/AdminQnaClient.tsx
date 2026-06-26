"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Lock, MessageCircleQuestion, RotateCcw, Trash2 } from "lucide-react";
import { adminQnaService, AdminQna } from "@/api/adminQnaService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { QnAAnswerDialog } from "./QnAAnswerDialog";

type Filter = "all" | "unanswered" | "answered";

const FILTER_TABS: { value: Filter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "unanswered", label: "미답변" },
  { value: "answered", label: "답변완료" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function AdminQnaClient() {
  const [qnaList, setQnaList] = useState<AdminQna[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [answerTarget, setAnswerTarget] = useState<AdminQna | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminQna | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchQnaList = useCallback(async (f: Filter) => {
    setIsLoading(true);
    try {
      const answered = f === "answered" ? "true" : f === "unanswered" ? "false" : undefined;
      const data = await adminQnaService.getQnaList(answered);
      setQnaList(data);
    } catch {
      toast.error("Q&A 목록을 불러오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQnaList(filter);
  }, [filter, fetchQnaList]);

  const handleAnswerSuccess = (updated: AdminQna) => {
    setQnaList((prev) => prev.map((q) => (q._id === updated._id ? updated : q)));
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await adminQnaService.deleteQna(deleteTarget._id);
      setQnaList((prev) => prev.filter((q) => q._id !== deleteTarget._id));
      toast.success("문의가 삭제되었습니다.");
      setDeleteTarget(null);
    } catch {
      toast.error("삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  const unansweredCount = qnaList.filter((q) => !q.answer).length;

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Q&A 관리</h1>
          {!isLoading && (
            <p className="mt-0.5 text-sm text-gray-500">
              총 <span className="font-semibold text-gray-700">{qnaList.length}</span>건
              {filter === "all" && unansweredCount > 0 && (
                <span className="ml-2 text-red-500">
                  · 미답변 <span className="font-semibold">{unansweredCount}</span>건
                </span>
              )}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchQnaList(filter)}
          className="gap-1.5"
        >
          <RotateCcw className="size-3.5" />
          새로고침
        </Button>
      </div>

      {/* 필터 탭 */}
      <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 w-fit">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === tab.value
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 목록 */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-gray-400">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-brand-blue" />
            불러오는 중...
          </div>
        ) : qnaList.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-20 text-gray-400">
            <MessageCircleQuestion className="size-8" />
            <p className="text-sm">
              {filter === "unanswered" ? "미답변 문의가 없습니다." : "등록된 문의가 없습니다."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {qnaList.map((qna) => (
              <li key={qna._id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start gap-4">
                  {/* 상태 뱃지 */}
                  <div className="mt-0.5 shrink-0">
                    {qna.answer ? (
                      <Badge variant="secondary" className="text-xs">답변완료</Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">미답변</Badge>
                    )}
                  </div>

                  {/* 내용 */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="text-xs font-semibold text-gray-700">
                        {qna.productId.name}
                      </span>
                      <span className="text-xs text-gray-300">·</span>
                      <div className="flex items-center gap-1">
                        {qna.isSecret && <Lock className="size-3 text-gray-400" />}
                        <span className="text-xs text-gray-500">{qna.userId.nickName}</span>
                      </div>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{formatDate(qna.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">{qna.content}</p>

                    {/* 답변 미리보기 */}
                    {qna.answer && (
                      <div className="mt-2 rounded-md bg-blue-50 px-3 py-2">
                        <p className="text-xs font-semibold text-brand-blue mb-0.5">판매자 답변</p>
                        <p className="text-xs text-gray-600 line-clamp-1">{qna.answer}</p>
                      </div>
                    )}
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex shrink-0 gap-1.5">
                    <Button
                      size="sm"
                      variant={qna.answer ? "outline" : "default"}
                      onClick={() => setAnswerTarget(qna)}
                    >
                      {qna.answer ? "답변 수정" : "답변하기"}
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="destructive"
                      onClick={() => setDeleteTarget(qna)}
                      aria-label="삭제"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 답변 다이얼로그 */}
      <QnAAnswerDialog
        qna={answerTarget}
        open={!!answerTarget}
        onOpenChange={(o) => !o && setAnswerTarget(null)}
        onSuccess={handleAnswerSuccess}
      />

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>문의 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 문의를 삭제하시겠습니까? 삭제된 문의는 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
