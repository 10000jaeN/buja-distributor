"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { reviewService, Review } from "@/api/reviewService";
import { EmptyState } from "./EmptyState";
import { ReviewRatingSummary } from "./ReviewRatingSummary";
import { ReviewCard } from "./ReviewCard";

const REVIEWS_PER_PAGE = 5;

type SortType = "latest" | "rating_desc" | "rating_asc";

const SORT_OPTIONS: { value: SortType; label: string }[] = [
  { value: "latest", label: "최신순" },
  { value: "rating_desc", label: "별점 높은순" },
  { value: "rating_asc", label: "별점 낮은순" },
];

type Props = {
  productId: string;
};

export function ProductReviewTab({ productId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortType>("latest");
  const [page, setPage] = useState(1);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    reviewService
      .getProductReviews(productId)
      .then(setReviews)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId]);

  // 라이트박스 Escape 키 닫기
  const closeLightbox = useCallback(() => setLightboxUrl(null), []);
  useEffect(() => {
    if (!lightboxUrl) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxUrl, closeLightbox]);

  // 별점 분포
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const ratingAverage =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  // 정렬
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sort === "rating_desc") return b.rating - a.rating;
    if (sort === "rating_asc") return a.rating - b.rating;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // 페이지네이션
  const totalPages = Math.ceil(sortedReviews.length / REVIEWS_PER_PAGE);
  const paginatedReviews = sortedReviews.slice(
    (page - 1) * REVIEWS_PER_PAGE,
    page * REVIEWS_PER_PAGE
  );

  const handleSortChange = (value: SortType) => {
    setSort(value);
    setPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-blue border-t-transparent" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        }
        title="아직 작성된 리뷰가 없습니다."
        description="구매 후 첫 번째 리뷰를 남겨보세요."
      />
    );
  }

  return (
    <div className="px-4 py-6 lg:px-0">
      {/* 별점 요약 */}
      <ReviewRatingSummary
        ratingAverage={ratingAverage}
        totalCount={reviews.length}
        distribution={distribution}
      />

      {/* 정렬 */}
      <div className="mt-5 flex gap-2">
        {SORT_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => handleSortChange(value)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              sort === value
                ? "border-brand-blue bg-brand-blue text-white"
                : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 리뷰 목록 */}
      <div className="mt-4">
        {paginatedReviews.map((review) => (
          <ReviewCard
            key={review._id}
            review={review}
            onImageClick={setLightboxUrl}
          />
        ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700 disabled:opacity-40 disabled:pointer-events-none"
            aria-label="이전 페이지"
          >
            <ChevronLeft className="size-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? "bg-brand-blue text-white"
                  : "border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
              aria-label={`${p}페이지`}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700 disabled:opacity-40 disabled:pointer-events-none"
            aria-label="다음 페이지"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}

      {/* 라이트박스 */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="닫기"
          >
            <X className="size-5" />
          </button>
          <img
            src={lightboxUrl}
            alt="리뷰 이미지"
            className="max-h-[90vh] max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
