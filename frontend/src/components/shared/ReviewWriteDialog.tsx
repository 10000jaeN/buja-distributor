"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { StarIcon, X, ImagePlus } from "lucide-react";
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
import { reviewService, Review } from "@/api/reviewService";

const MAX_IMAGES = 5;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId?: string;
  productName?: string;
  orderId?: string;
  existingReview?: Review;
  onSuccess: (review: Review) => void;
};

export default function ReviewWriteDialog({
  open,
  onOpenChange,
  productId,
  productName,
  orderId,
  existingReview,
  onSuccess,
}: Props) {
  const isEditMode = !!existingReview;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState(existingReview?.content ?? "");
  // 이미 업로드된 이미지 URL 목록
  const [uploadedImages, setUploadedImages] = useState<string[]>(
    existingReview?.images ?? []
  );
  // 아직 업로드 안 된 로컬 파일 목록
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  // 미리보기용 Object URL (pendingFiles와 1:1 대응)
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setRating(existingReview?.rating ?? 0);
      setContent(existingReview?.content ?? "");
      setUploadedImages(existingReview?.images ?? []);
      setPendingFiles([]);
      setPreviewUrls([]);
      setHoverRating(0);
    }
  }, [open, existingReview]);

  // pendingFiles가 바뀔 때 Object URL 생성/해제
  useEffect(() => {
    const urls = pendingFiles.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [pendingFiles]);

  const totalImageCount = uploadedImages.length + pendingFiles.length;
  const canAddMore = totalImageCount < MAX_IMAGES;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const remaining = MAX_IMAGES - totalImageCount;
    const toAdd = files.slice(0, remaining);

    if (files.length > remaining) {
      toast.error(`이미지는 최대 ${MAX_IMAGES}장까지 업로드 가능합니다.`);
    }
    setPendingFiles((prev) => [...prev, ...toAdd]);
    e.target.value = "";
  };

  const removeUploadedImage = (url: string) => {
    setUploadedImages((prev) => prev.filter((u) => u !== url));
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (files: File[]): Promise<string[]> => {
    const token =
      localStorage.getItem("accessToken") ?? sessionStorage.getItem("accessToken");
    return Promise.all(
      files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
        if (!res.ok) throw new Error("이미지 업로드에 실패했습니다.");
        const data = await res.json();
        return data.url as string;
      })
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("별점을 선택해주세요.");
      return;
    }
    if (content.trim().length < 10) {
      toast.error("리뷰는 최소 10자 이상 작성해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newUrls = pendingFiles.length > 0 ? await uploadFiles(pendingFiles) : [];
      const images = [...uploadedImages, ...newUrls];

      let result: Review;
      if (isEditMode && existingReview) {
        result = await reviewService.updateReview(existingReview._id, {
          rating,
          content: content.trim(),
          images,
        });
        toast.success("리뷰가 수정되었습니다.");
      } else {
        if (!productId) throw new Error("상품 정보가 없습니다.");
        result = await reviewService.createReview({
          productId,
          orderId,
          rating,
          content: content.trim(),
          images,
        });
        toast.success("리뷰가 등록되었습니다.");
      }
      onSuccess(result);
      onOpenChange(false);
    } catch (err: unknown) {
      const error = err as Error & { status?: number };
      if (error.status === 409) {
        toast.error("이미 해당 주문에 리뷰를 작성했습니다.");
      } else {
        toast.error(error.message || (isEditMode ? "리뷰 수정에 실패했습니다." : "리뷰 등록에 실패했습니다."));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayName =
    productName ??
    (existingReview && typeof existingReview.productId !== "string"
      ? existingReview.productId.name
      : "상품");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "리뷰 수정" : "리뷰 작성"}</DialogTitle>
          {displayName && (
            <p className="mt-0.5 truncate text-sm text-gray-500">{displayName}</p>
          )}
        </DialogHeader>

        <div className="space-y-5 py-1">
          {/* 별점 */}
          <div className="space-y-1.5">
            <Label>별점</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-0.5 transition-transform hover:scale-110"
                  aria-label={`별점 ${star}점`}
                >
                  <StarIcon
                    className={`size-7 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-1.5 self-center text-sm font-medium text-gray-600">
                  {rating}점
                </span>
              )}
            </div>
          </div>

          {/* 리뷰 내용 */}
          <div className="space-y-1.5">
            <Label htmlFor="review-content">
              리뷰 내용
              <span className="ml-1 text-xs font-normal text-gray-400">(최소 10자)</span>
            </Label>
            <Textarea
              id="review-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="상품에 대한 솔직한 리뷰를 남겨주세요."
              rows={4}
              className="resize-none"
            />
            <p className="text-right text-xs text-gray-400">{content.trim().length}자</p>
          </div>

          {/* 이미지 업로드 */}
          <div className="space-y-1.5">
            <Label>
              사진 첨부
              <span className="ml-1 text-xs font-normal text-gray-400">
                ({totalImageCount}/{MAX_IMAGES})
              </span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {/* 업로드된 이미지 */}
              {uploadedImages.map((url) => (
                <div key={url} className="relative h-20 w-20 shrink-0">
                  <img
                    src={url}
                    alt="리뷰 이미지"
                    className="h-full w-full rounded-lg border border-gray-100 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeUploadedImage(url)}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-700 text-white hover:bg-gray-900"
                    aria-label="이미지 제거"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}

              {/* 미업로드 파일 미리보기 */}
              {previewUrls.map((url, i) => (
                <div key={i} className="relative h-20 w-20 shrink-0">
                  <img
                    src={url}
                    alt="미리보기"
                    className="h-full w-full rounded-lg border border-gray-100 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePendingFile(i)}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-700 text-white hover:bg-gray-900"
                    aria-label="이미지 제거"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}

              {/* 추가 버튼 */}
              {canAddMore && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-gray-300 text-gray-400 transition-colors hover:border-gray-400 hover:text-gray-500"
                >
                  <ImagePlus className="size-5" />
                  <span className="text-xs">사진 추가</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "저장 중..." : isEditMode ? "수정하기" : "등록하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
