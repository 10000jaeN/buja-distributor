import { StarIcon } from "lucide-react";

type Props = {
  ratingAverage: number;
  totalCount: number;
  distribution: { star: number; count: number }[];
};

export function ReviewRatingSummary({ ratingAverage, totalCount, distribution }: Props) {
  return (
    <div className="flex gap-6 rounded-xl bg-gray-50 p-5">
      {/* 평균 별점 */}
      <div className="flex min-w-[88px] flex-col items-center justify-center gap-1.5">
        <span className="text-4xl font-bold text-gray-800">{ratingAverage.toFixed(1)}</span>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <StarIcon
              key={s}
              className={`size-4 ${
                s <= Math.round(ratingAverage)
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-200 text-gray-200"
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-gray-500">{totalCount}개의 리뷰</span>
      </div>

      {/* 별점 분포 바 */}
      <div className="flex flex-1 flex-col justify-center gap-2">
        {distribution.map(({ star, count }) => (
          <div key={star} className="flex items-center gap-2">
            <span className="w-2.5 text-right text-xs text-gray-500">{star}</span>
            <StarIcon className="size-3 shrink-0 fill-yellow-400 text-yellow-400" />
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-yellow-400 transition-all duration-500"
                style={{ width: totalCount ? `${(count / totalCount) * 100}%` : "0%" }}
              />
            </div>
            <span className="w-5 text-right text-xs text-gray-500">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
