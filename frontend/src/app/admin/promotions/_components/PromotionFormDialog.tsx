"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Promotion, PromotionFormData, PromotionTarget, PromotionType } from "@/api/promotionService";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PromotionFormData) => Promise<void>;
  initial?: Promotion | null;
  isSubmitting: boolean;
};

const EMPTY: PromotionFormData = {
  name: "",
  description: "",
  type: "percentage",
  value: 0,
  target: "all",
  targetIds: [],
  minQuantity: null,
  minOrderAmount: null,
  startDate: "",
  endDate: "",
  isActive: true,
};

export default function PromotionFormDialog({ open, onClose, onSubmit, initial, isSubmitting }: Props) {
  const [form, setForm] = useState<PromotionFormData>(EMPTY);
  const [targetIdsInput, setTargetIdsInput] = useState("");

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name,
        description: initial.description,
        type: initial.type,
        value: initial.value,
        target: initial.target,
        targetIds: initial.targetIds,
        minQuantity: initial.minQuantity,
        minOrderAmount: initial.minOrderAmount,
        startDate: initial.startDate.slice(0, 16),
        endDate: initial.endDate.slice(0, 16),
        isActive: initial.isActive,
      });
      setTargetIdsInput(initial.targetIds.join(", "));
    } else {
      setForm(EMPTY);
      setTargetIdsInput("");
    }
  }, [initial, open]);

  if (!open) return null;

  const set = <K extends keyof PromotionFormData>(key: K, value: PromotionFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ids = targetIdsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    await onSubmit({ ...form, targetIds: ids });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-800">
            {initial ? "프로모션 수정" : "프로모션 생성"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto p-6" style={{ maxHeight: "70vh" }}>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">프로모션명 *</Label>
            <Input
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="여름 세일"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">설명</Label>
            <Input
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="프로모션 설명 (선택)"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">할인 유형 *</Label>
              <select
                value={form.type}
                onChange={(e) => set("type", e.target.value as PromotionType)}
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

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">적용 대상 *</Label>
            <select
              value={form.target}
              onChange={(e) => set("target", e.target.value as PromotionTarget)}
              className="h-9 w-full rounded-md border border-gray-200 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              <option value="all">전체 상품</option>
              <option value="product">특정 상품 (상품 ID)</option>
              <option value="category">특정 카테고리 (parent명)</option>
            </select>
          </div>

          {form.target !== "all" && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                {form.target === "product" ? "상품 ID (쉼표 구분)" : "카테고리 parent명 (쉼표 구분)"}
              </Label>
              <Input
                value={targetIdsInput}
                onChange={(e) => setTargetIdsInput(e.target.value)}
                placeholder={form.target === "product" ? "6123abc..., 6456def..." : "식품, 생활용품"}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">최소 수량</Label>
              <Input
                type="number"
                min={0}
                value={form.minQuantity ?? ""}
                onChange={(e) => set("minQuantity", e.target.value ? Number(e.target.value) : null)}
                placeholder="없음"
              />
            </div>
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">시작일 *</Label>
              <Input
                type="datetime-local"
                required
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">종료일 *</Label>
              <Input
                type="datetime-local"
                required
                value={form.endDate}
                onChange={(e) => set("endDate", e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 accent-brand-blue"
            />
            <Label htmlFor="isActive" className="cursor-pointer text-sm text-gray-700">
              활성화
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "저장 중..." : initial ? "수정" : "생성"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
