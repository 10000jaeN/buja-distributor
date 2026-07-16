"use client";

import { Product } from "@/types/product";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import noImage from "@/public/images/no-image.png";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SORT_OPTIONS = [
  { label: "최신순", value: "recent" },
  { label: "인기순", value: "populate" },
  { label: "낮은 가격순", value: "price_asc" },
  { label: "높은 가격순", value: "price_desc" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

type Props = {
  initialProducts: Product[];
  q: string;
  sort: SortValue;
};

export default function SearchClient({ initialProducts, q, sort }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const updateSort = (value: string) => {
    startTransition(() => {
      router.push(`/search?q=${encodeURIComponent(q)}&sort=${value}`);
    });
  };

  return (
    <div className="mx-auto max-w-[var(--max-width)] px-5 py-10">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-400">
          <Link href="/" className="hover:text-brand-blue">홈</Link>
          <span>/</span>
          <span className="text-gray-600">검색</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {q ? (
            <>
              <span className="text-brand-blue">&ldquo;{q}&rdquo;</span> 검색 결과
            </>
          ) : (
            "검색"
          )}
        </h1>
      </div>

      {!q ? (
        <div className="flex min-h-60 flex-col items-center justify-center gap-2">
          <p className="text-gray-400">검색어를 입력해주세요.</p>
        </div>
      ) : (
        <div className={`transition-opacity ${isPending ? "opacity-50" : ""}`}>
          {/* 상단 바 */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {isPending ? "불러오는 중..." : `총 ${initialProducts.length}개`}
            </p>
            <Select value={sort} onValueChange={(value) => value && updateSort(value)}>
              <SelectTrigger>
                <SelectValue>
                  {SORT_OPTIONS.find((opt) => opt.value === sort)?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {initialProducts.length === 0 ? (
            <div className="flex min-h-60 flex-col items-center justify-center gap-3">
              <p className="text-gray-400">
                <span className="font-medium text-gray-600">&ldquo;{q}&rdquo;</span>에 대한 검색 결과가 없습니다.
              </p>
              <Link href="/products" className="text-brand-blue text-sm hover:underline">
                전체 상품 보기
              </Link>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
              {initialProducts.map((product) => (
                <li key={product._id}>
                  <Link href={`/products/${product.slug}`} className="group block">
                    <div className="overflow-hidden rounded-xl border border-gray-100">
                      <Image
                        src={product.thumbnail[0] ?? noImage}
                        alt={product.name}
                        width={300}
                        height={300}
                        className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-52 md:h-60 lg:h-56"
                      />
                    </div>
                    <div className="mt-2.5 space-y-1 px-0.5">
                      <p className="line-clamp-2 text-sm font-medium text-gray-800 group-hover:text-brand-blue">
                        {product.name}
                      </p>
                      <p className="text-sm font-bold text-gray-900">
                        {product.price.toLocaleString()}원
                      </p>
                      {!product.isAvailable && (
                        <span className="text-xs text-gray-400">품절</span>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
