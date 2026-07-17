"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coupon, CouponFormData, CouponType } from "@/api/couponService";

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
  maxUses: null,
  maxUsesPerUser: 1,
  expiresAt: null,
  isActive: true,
};

export default function CouponFormDialog({ open, onClose, onSubmit, initial, isSubmitting }: Props) {
  const [form, setForm] = useState<CouponFormData>(EMPTY);

  useEffect(() => {
    if (initial) {
      setForm({
        code: initial.code,
        name: initial.name,
        type: initial.type,
        value: initial.value,
        maxDiscount: initial.maxDiscount,
        minOrderAmount: initial.minOrderAmount,
        maxUses: initial.maxUses,
        maxUsesPerUser: initial.maxUsesPerUser,
        expiresAt: initial.expiresAt ? initial.expiresAt.slice(0, 16) : null,
        isActive: initial.isActive,
      });
    } else {
      setForm(EMPTY);
    }
  }, [initial, open]);

  if (!open) return null;

  const set = <K extends keyof CouponFormData>(key: K, value: CouponFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  const isEdit = !!initial;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-800">
            {isEdit ? "쿠폰 수정" : "쿠폰 생성"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto p-6" style={{ maxHeight: "70vh" }}>
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
            <Label className="text-sm font-medium text-gray-700">전체 발급 수량 (원)</Label>
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
