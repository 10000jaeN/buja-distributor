"use client";

import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { qnaService } from "@/api/qnaService";
import { Qna } from "@/types/qna";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  onSuccess: (qna: Qna) => void;
};

export function QnAWriteDialog({
  open,
  onOpenChange,
  productId,
  productName,
  onSuccess,
}: Props) {
  const [content, setContent] = useState("");
  const [isSecret, setIsSecret] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setContent("");
      setIsSecret(false);
    }
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    if (content.trim().length < 5) {
      toast.error("문의 내용을 5자 이상 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await qnaService.createQna({
        productId,
        content: content.trim(),
        isSecret,
      });
      toast.success("문의가 등록되었습니다.");
      onSuccess(result);
      handleOpenChange(false);
    } catch {
      toast.error("문의 등록에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>상품 문의</DialogTitle>
          <p className="mt-0.5 truncate text-sm text-gray-500">{productName}</p>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="qna-content">
              문의 내용
              <span className="ml-1 text-xs font-normal text-gray-400">(최소 5자)</span>
            </Label>
            <Textarea
              id="qna-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="상품에 대해 궁금한 점을 남겨주세요."
              rows={5}
              className="resize-none"
              disabled={isSubmitting}
            />
            <p className="text-right text-xs text-gray-400">{content.trim().length}자</p>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <Lock className="size-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">비밀글</p>
                <p className="text-xs text-gray-400">작성자와 관리자만 내용을 볼 수 있어요.</p>
              </div>
            </div>
            <Switch
              checked={isSecret}
              onCheckedChange={setIsSecret}
              disabled={isSubmitting}
              aria-label="비밀글 설정"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "등록 중..." : "문의 등록"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
