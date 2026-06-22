"use client";

import { Product } from "@/types/product";
import ProductCard from "@/components/shared/ProductCard";
import { Star } from "lucide-react";

const RANK_STYLES: Record<number, string> = {
  1: "bg-yellow-400 text-white",
  2: "bg-gray-300 text-white",
  3: "bg-amber-600 text-white",
};

export default function BestClient({ products }: { products: Product[] }) {
  return (
    <div className="mx-auto max-w-[1024px] px-5 py-10">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-page-title">
          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          베스트 상품
        </h1>
        <p className="mt-1 text-sub">별점 · 판매량 · 리뷰수 기준으로 선정된 인기 상품입니다.</p>
      </div>

      {products.length === 0 ? (
        <div className="flex h-60 items-center justify-center text-sub">
          상품이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product, idx) => {
            const rank = idx + 1;
            return (
              <div key={product._id} className="relative">
                {rank <= 3 && (
                  <span
                    className={`absolute top-2 left-2 z-10 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${RANK_STYLES[rank]}`}
                  >
                    {rank}
                  </span>
                )}
                <ProductCard product={product} priority={rank <= 4} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
