"use client";

import { productService } from "@/api/productService";
import { categoryService } from "@/api/categoryService";
import { Product } from "@/types/product";
import Link from "next/link";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ProductCard from "@/components/shared/ProductCard";
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

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const category = searchParams.get("category") ?? "";
  const sub = searchParams.get("sub") ?? "";
  const sort = (searchParams.get("sort") as SortValue) ?? "recent";

  const [products, setProducts] = useState<Product[]>([]);
  const [children, setChildren] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [products, children] = await Promise.all([
          productService.getProducts({
            category: category || undefined,
            sub: sub || undefined,
            sort,
          }),
          category
            ? categoryService.getCategories().then(
                (cats) => cats.find((c) => c.parent === category)?.children ?? []
              )
            : Promise.resolve([]),
        ]);
        if (!cancelled) {
          setProducts(products);
          setChildren(children);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [category, sub, sort]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key === "category") params.delete("sub");
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="mx-auto max-w-[1024px] px-5 py-10">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-400">
          <Link href="/" className="hover:text-brand-blue">홈</Link>
          <span>/</span>
          {category ? (
            <>
              <button
                onClick={() => router.push("/products")}
                className="hover:text-brand-blue"
              >
                전체
              </button>
              <span>/</span>
              <span className="text-gray-600">{category}</span>
              {sub && (
                <>
                  <span>/</span>
                  <span className="text-gray-600">{sub}</span>
                </>
              )}
            </>
          ) : (
            <span className="text-gray-600">전체 상품</span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {sub || category || "전체 상품"}
        </h1>
      </div>

      {/* 소분류 탭 */}
      {children.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          <button
            onClick={() => updateParam("sub", "")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              !sub
                ? "bg-brand-blue text-white"
                : "border border-gray-200 text-gray-600 hover:border-brand-blue hover:text-brand-blue"
            }`}
          >
            전체
          </button>
          {children.map((child) => (
            <button
              key={child}
              onClick={() => updateParam("sub", child)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                sub === child
                  ? "bg-brand-blue text-white"
                  : "border border-gray-200 text-gray-600 hover:border-brand-blue hover:text-brand-blue"
              }`}
            >
              {child}
            </button>
          ))}
        </div>
      )}

      {/* 상단 바: 상품 수 + 정렬 */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {isLoading ? "불러오는 중..." : `총 ${products.length}개`}
        </p>
        <Select value={sort} onValueChange={(value) => value && updateParam("sort", value)}>
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

      {/* 상품 그리드 */}
      {isLoading ? (
        <div className="flex min-h-60 items-center justify-center">
          <div className="border-t-brand-blue h-8 w-8 animate-spin rounded-full border-3 border-gray-200" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex min-h-60 flex-col items-center justify-center gap-2">
          <p className="text-gray-400">상품이 없습니다.</p>
          <button
            onClick={() => router.push("/products")}
            className="text-brand-blue text-sm hover:underline"
          >
            전체 상품 보기
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
          {products.map((product) => (
            <li key={product._id}>
              <ProductCard product={product} size="lg" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
