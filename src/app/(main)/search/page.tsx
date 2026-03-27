"use client";

import { productService } from "@/api/productService";
import { Product } from "@/types/product";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import noImage from "@/public/images/no-image.png";

const SORT_OPTIONS = [
  { label: "최신순", value: "recent" },
  { label: "인기순", value: "populate" },
  { label: "낮은 가격순", value: "price_asc" },
  { label: "높은 가격순", value: "price_desc" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const q = searchParams.get("q") ?? "";
  const sort = (searchParams.get("sort") as SortValue) ?? "recent";

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!q) return;
    setIsLoading(true);
    productService
      .getProducts({ q, sort })
      .then(setProducts)
      .finally(() => setIsLoading(false));
  }, [q, sort]);

  const updateSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="mx-auto max-w-[1024px] px-5 py-10">
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
      ) : isLoading ? (
        <div className="flex min-h-60 items-center justify-center">
          <div className="border-t-brand-blue h-8 w-8 animate-spin rounded-full border-3 border-gray-200" />
        </div>
      ) : (
        <>
          {/* 상단 바 */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">총 {products.length}개</p>
            <select
              value={sort}
              onChange={(e) => updateSort(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-brand-blue"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {products.length === 0 ? (
            <div className="flex min-h-60 flex-col items-center justify-center gap-3">
              <p className="text-gray-400">
                <span className="font-medium text-gray-600">&ldquo;{q}&rdquo;</span>에 대한 검색 결과가 없습니다.
              </p>
              <Link href="/products" className="text-brand-blue text-sm hover:underline">
                전체 상품 보기
              </Link>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <li key={product._id}>
                  <Link href={`/products/${product.slug}`} className="group block">
                    <div className="overflow-hidden rounded-xl border border-gray-100">
                      <Image
                        src={product.thumbnail[0] ?? noImage}
                        alt={product.name}
                        width={300}
                        height={300}
                        className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-52"
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
        </>
      )}
    </div>
  );
}
