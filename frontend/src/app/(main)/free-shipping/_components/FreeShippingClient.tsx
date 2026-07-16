"use client";

import { Product } from "@/types/product";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import ProductCard from "@/components/shared/ProductCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Truck } from "lucide-react";

const SORT_OPTIONS = [
  { label: "최신순", value: "recent" },
  { label: "인기순", value: "populate" },
  { label: "낮은 가격순", value: "price_asc" },
  { label: "높은 가격순", value: "price_desc" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

type Props = {
  initialProducts: Product[];
  sort: SortValue;
};

export default function FreeShippingClient({ initialProducts, sort }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSortChange = (value: string) => {
    startTransition(() => {
      router.push(`/free-shipping?sort=${value}`);
    });
  };

  return (
    <div className={`mx-auto max-w-[var(--max-width)] px-5 py-10 transition-opacity ${isPending ? "opacity-50" : ""}`}>
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-page-title">
          <Truck className="h-5 w-5 text-brand-blue" />
          무료배송
        </h1>
        <p className="mt-1 text-sub">배송비 없이 무료로 받아보세요.</p>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-subtle">
          {isPending ? "불러오는 중..." : `총 ${initialProducts.length}개`}
        </p>
        <Select value={sort} onValueChange={(value) => value && handleSortChange(value)}>
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

      {initialProducts.length === 0 && !isPending ? (
        <div className="flex min-h-60 flex-col items-center justify-center gap-2">
          <p className="text-muted">무료배송 상품이 없습니다.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
          {initialProducts.map((product) => (
            <li key={product._id}>
              <ProductCard product={product} size="lg" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
