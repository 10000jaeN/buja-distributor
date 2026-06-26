import { StarIcon } from "lucide-react";
import { Review } from "@/api/reviewService";

type Props = {
  review: Review;
  onImageClick: (url: string) => void;
};

export function ReviewCard({ review, onImageClick }: Props) {
  const userName =
    review.userId && typeof review.userId !== "string"
      ? review.userId.userName
      : "익명";

  const date = new Date(review.createdAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="border-b border-gray-100 py-5 last:border-b-0">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-800">{userName}</span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <StarIcon
                key={s}
                className={`size-3.5 ${
                  s <= review.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-200 text-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
        <span className="shrink-0 text-xs text-gray-400">{date}</span>
      </div>

      <p className="whitespace-pre-wrap text-sm text-gray-700">{review.content}</p>

      {review.images && review.images.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {review.images.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onImageClick(url)}
              className="h-16 w-16 overflow-hidden rounded-lg border border-gray-100 transition-opacity hover:opacity-75"
              aria-label={`리뷰 이미지 ${i + 1} 크게 보기`}
            >
              <img
                src={url}
                alt={`리뷰 이미지 ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
