"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { adminQnaService, AdminQna } from "@/api/adminQnaService";
import { formatDate } from "@/lib/dateUtils";

type Props = {
  qna: AdminQna | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (updated: AdminQna) => void;
};

export function QnAAnswerDialog({ qna, open, onOpenChange, onSuccess }: Props) {
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) setAnswer(qna?.answer ?? "");
  }, [open, qna]);

  const handleSubmit = async () => {
    if (!qna) return;
    if (!answer.trim()) {
      toast.error("답변 내용을 입력해주세요.");
      return;
    }
    setIsSubmitting(true);
    try {
      const updated = await adminQnaService.answerQna(qna._id, answer.trim());
      toast.success("답변이 등록되었습니다.");
      onSuccess(updated);
      onOpenChange(false);
    } catch {
      toast.error("답변 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!qna) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>문의 답변</DialogTitle>
          <p className="mt-0.5 truncate text-sm text-gray-500">
            {qna.productId.name}
          </p>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* 원본 문의 */}
          <div className="rounded-lg bg-gray-50 p-4 space-y-1.5">
            <div className="flex items-center gap-1.5">
              {qna.isSecret && <Lock className="size-3 text-gray-400" />}
              <span className="text-xs font-medium text-gray-500">
                {qna.userId.nickName}
              </span>
              <span className="text-xs text-gray-300">·</span>
              <span className="text-xs text-gray-400">{formatDate(qna.createdAt)}</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{qna.content}</p>
          </div>

          {/* 답변 입력 */}
          <div className="space-y-1.5">
            <Label htmlFor="qna-answer">
              {qna.answer ? "답변 수정" : "답변 작성"}
            </Label>
            <Textarea
              id="qna-answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="고객 문의에 대한 답변을 작성해주세요."
              rows={5}
              className="resize-none"
              disabled={isSubmitting}
            />
            <p className="text-right text-xs text-gray-400">{answer.trim().length}자</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "등록 중..." : qna.answer ? "답변 수정" : "답변 등록"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
