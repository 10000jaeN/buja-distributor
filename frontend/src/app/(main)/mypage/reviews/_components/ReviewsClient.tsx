"use client";

import { reviewService, Review } from "@/api/reviewService";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { StarIcon, Pencil, Trash2 } from "lucide-react";
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
import ReviewWriteDialog from "@/components/shared/ReviewWriteDialog";

export default function ReviewsClient() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<Review | null>(null);

  useEffect(() => {
    reviewService
      .getMyReviews()
      .then(setReviews)
      .catch(() => setLoadError(true))
      .finally(() => setIsLoading(false));
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    const id = deleteTargetId;
    setDeleteTargetId(null);
    try {
      await reviewService.deleteReview(id);
      setReviews((prev) => prev.filter((r) => r._id !== id));
      toast.success("리뷰가 삭제되었습니다.");
    } catch {
      toast.error("리뷰 삭제에 실패했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <div className="border-t-brand-blue h-7 w-7 animate-spin rounded-full border-3 border-gray-200" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-10 text-center shadow-sm">
        <p className="text-sm text-gray-400">리뷰 목록을 불러오지 못했습니다.</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-10 text-center shadow-sm">
        <p className="text-sm text-gray-400">작성한 리뷰가 없습니다.</p>
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
            <AlertDialogTitle>리뷰를 삭제할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              삭제된 리뷰는 복구할 수 없습니다.
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

      {editTarget && (
        <ReviewWriteDialog
          open={editTarget !== null}
          onOpenChange={(open) => { if (!open) setEditTarget(null); }}
          existingReview={editTarget}
          onSuccess={(updated) => {
            setReviews((prev) =>
              prev.map((r) => (r._id === updated._id ? updated : r))
            );
            setEditTarget(null);
          }}
        />
      )}

      <div className="space-y-4">
        {reviews.map((review) => {
          const product =
            typeof review.productId === "string" ? null : review.productId;

          return (
            <div
              key={review._id}
              className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                {/* 상품 정보 */}
                <div className="flex min-w-0 items-center gap-3">
                  {product?.thumbnail?.[0] && (
                    <img
                      src={product.thumbnail[0]}
                      alt={product.name}
                      className="h-14 w-14 shrink-0 rounded-lg border border-gray-100 object-cover"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-800">
                      {product?.name ?? "상품"}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                </div>

                {/* 수정/삭제 */}
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => setEditTarget(review)}
                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
                    aria-label="리뷰 수정"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTargetId(review._id)}
                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    aria-label="리뷰 삭제"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              {/* 별점 */}
              <div className="mt-3 flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    className={`size-4 ${
                      star <= review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200"
                    }`}
                  />
                ))}
              </div>

              {/* 내용 */}
              <p className="mt-2 text-sm leading-relaxed text-gray-700">
                {review.content}
              </p>

              {/* 이미지 */}
              {review.images && review.images.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {review.images.map((url) => (
                    <img
                      key={url}
                      src={url}
                      alt="리뷰 이미지"
                      className="h-16 w-16 rounded-lg border border-gray-100 object-cover"
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
