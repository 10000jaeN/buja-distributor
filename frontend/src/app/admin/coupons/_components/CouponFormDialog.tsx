"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coupon, CouponFormData, CouponTarget, CouponType } from "@/api/couponService";
import { productService } from "@/api/productService";
import { categoryService } from "@/api/categoryService";
import { Product, Category } from "@/types/product";
import { Search } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CouponFormData) => Promise<void>;
  initial?: Coupon | null;
  isSubmitting: boolean;
};

const EMPTY: CouponFormData = {
  code: "",
  name: "",
  type: "percentage",
  value: 0,
  maxDiscount: null,
  minOrderAmount: null,
  target: "all",
  targetIds: [],
  maxUses: null,
  maxUsesPerUser: 1,
  expiresAt: null,
  isActive: true,
};

type MultiSelectProps = {
  items: { id: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  isLoading?: boolean;
};

function MultiSelectBox({ items, selected, onChange, placeholder = "검색...", isLoading }: MultiSelectProps) {
  const [search, setSearch] = useState("");
  const filtered = items.filter((item) => item.label.toLowerCase().includes(search.toLowerCase()));

  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  };

  return (
    <div className="rounded-md border border-gray-200">
      <div className="relative border-b border-gray-100 px-3 py-2">
        <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent pl-6 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
        />
      </div>
      <div className="max-h-48 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-brand-blue" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-4 text-center text-xs text-gray-400">검색 결과가 없습니다.</p>
        ) : (
          filtered.map((item) => (
            <label key={item.id} className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50">
              <input
                type="checkbox"
                checked={selected.includes(item.id)}
                onChange={() => toggle(item.id)}
                className="h-4 w-4 rounded border-gray-300 accent-brand-blue"
              />
              <span className="text-gray-700">{item.label}</span>
            </label>
          ))
        )}
      </div>
      {selected.length > 0 && (
        <div className="border-t border-gray-100 px-3 py-2 text-xs text-gray-500">
          {selected.length}개 선택됨
        </div>
      )}
    </div>
  );
}

export default function CouponFormDialog({ open, onClose, onSubmit, initial, isSubmitting }: Props) {
  const [form, setForm] = useState<CouponFormData>(EMPTY);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        code: initial.code,
        name: initial.name,
        type: initial.type,
        value: initial.value,
        maxDiscount: initial.maxDiscount,
        minOrderAmount: initial.minOrderAmount,
        target: initial.target ?? "all",
        targetIds: initial.targetIds ?? [],
        maxUses: initial.maxUses,
        maxUsesPerUser: initial.maxUsesPerUser,
        expiresAt: initial.expiresAt ? initial.expiresAt.slice(0, 16) : null,
        isActive: initial.isActive,
      });
    } else {
      setForm(EMPTY);
    }
  }, [initial, open]);

  useEffect(() => {
    if (!open) return;
    if (form.target === "product" && products.length === 0) {
      setIsLoadingOptions(true);
      productService.getProducts({}).then(setProducts).finally(() => setIsLoadingOptions(false));
    }
    if (form.target === "category" && categories.length === 0) {
      setIsLoadingOptions(true);
      categoryService.getCategories().then(setCategories).finally(() => setIsLoadingOptions(false));
    }
  }, [form.target, open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;

  const set = <K extends keyof CouponFormData>(key: K, value: CouponFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleTargetChange = (target: CouponTarget) => {
    setForm((prev) => ({ ...prev, target, targetIds: [] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  const isEdit = !!initial;
  const productItems = products.map((p) => ({ id: p._id, label: p.name }));
  const categoryItems = categories.map((c) => ({ id: c.parent, label: c.parent }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-800">
            {isEdit ? "쿠폰 수정" : "쿠폰 생성"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto p-6" style={{ maxHeight: "75vh" }}>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">쿠폰 코드 *</Label>
            <Input
              required
              disabled={isEdit}
              value={form.code}
              onChange={(e) => set("code", e.target.value.toUpperCase())}
              placeholder="SUMMER2024"
              className={isEdit ? "bg-gray-50 text-gray-500" : ""}
            />
            {isEdit && <p className="text-xs text-gray-400">쿠폰 코드는 생성 후 변경할 수 없습니다.</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">쿠폰명 *</Label>
            <Input
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="여름 시즌 10% 할인"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">할인 유형 *</Label>
              <select
                value={form.type}
                onChange={(e) => set("type", e.target.value as CouponType)}
                className="h-9 w-full rounded-md border border-gray-200 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="percentage">정률 (%)</option>
                <option value="fixed">정액 (원)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                할인값 * {form.type === "percentage" ? "(%)" : "(원)"}
              </Label>
              <Input
                type="number"
                required
                min={0}
                value={form.value}
                onChange={(e) => set("value", Number(e.target.value))}
              />
            </div>
          </div>

          {form.type === "percentage" && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">최대 할인 상한 (원)</Label>
              <Input
                type="number"
                min={0}
                value={form.maxDiscount ?? ""}
                onChange={(e) => set("maxDiscount", e.target.value ? Number(e.target.value) : null)}
                placeholder="없음"
              />
            </div>
          )}

          {/* 적용 대상 */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">적용 대상</Label>
            <select
              value={form.target}
              onChange={(e) => handleTargetChange(e.target.value as CouponTarget)}
              className="h-9 w-full rounded-md border border-gray-200 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              <option value="all">전체 상품</option>
              <option value="product">특정 상품 선택</option>
              <option value="category">특정 카테고리 선택</option>
            </select>
          </div>

          {form.target === "product" && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">상품 선택</Label>
              <MultiSelectBox
                items={productItems}
                selected={form.targetIds ?? []}
                onChange={(ids) => set("targetIds", ids)}
                placeholder="상품명 검색..."
                isLoading={isLoadingOptions}
              />
            </div>
          )}

          {form.target === "category" && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">카테고리 선택</Label>
              <MultiSelectBox
                items={categoryItems}
                selected={form.targetIds ?? []}
                onChange={(ids) => set("targetIds", ids)}
                placeholder="카테고리명 검색..."
                isLoading={isLoadingOptions}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">최소 주문금액 (원)</Label>
              <Input
                type="number"
                min={0}
                value={form.minOrderAmount ?? ""}
                onChange={(e) => set("minOrderAmount", e.target.value ? Number(e.target.value) : null)}
                placeholder="없음"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">1인 사용 가능 횟수</Label>
              <Input
                type="number"
                min={1}
                value={form.maxUsesPerUser}
                onChange={(e) => set("maxUsesPerUser", Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">전체 발급 수량</Label>
            <Input
              type="number"
              min={0}
              value={form.maxUses ?? ""}
              onChange={(e) => set("maxUses", e.target.value ? Number(e.target.value) : null)}
              placeholder="무제한"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">만료일</Label>
            <Input
              type="datetime-local"
              value={form.expiresAt ?? ""}
              onChange={(e) => set("expiresAt", e.target.value || null)}
            />
            <p className="text-xs text-gray-400">미입력 시 무기한</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="couponActive"
              checked={form.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 accent-brand-blue"
            />
            <Label htmlFor="couponActive" className="cursor-pointer text-sm text-gray-700">
              활성화
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "저장 중..." : isEdit ? "수정" : "생성"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
