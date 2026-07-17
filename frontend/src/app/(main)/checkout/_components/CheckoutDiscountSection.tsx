"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { checkoutService, ValidateCouponResult } from "@/api/checkoutService";
import { X } from "lucide-react";

type Props = {
  userPoints: number;
  pointsToUse: number;
  onPointsChange: (v: number) => void;
  appliedCoupon: ValidateCouponResult | null;
  onCouponApply: (coupon: ValidateCouponResult) => void;
  onCouponRemove: () => void;
  subtotal: number;
};

export default function CheckoutDiscountSection({
  userPoints,
  pointsToUse,
  onPointsChange,
  appliedCoupon,
  onCouponApply,
  onCouponRemove,
  subtotal,
}: Props) {
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const handleCouponApply = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const result = await checkoutService.validateCoupon(couponInput.trim(), subtotal);
      onCouponApply(result);
      setCouponInput("");
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "유효하지 않은 쿠폰입니다.";
      setCouponError(msg);
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePointsInput = (value: string) => {
    const num = parseInt(value.replace(/\D/g, ""), 10);
    if (isNaN(num) || num < 0) {
      onPointsChange(0);
    } else {
      onPointsChange(Math.min(num, userPoints));
    }
  };

  const handleUseAllPoints = () => {
    onPointsChange(userPoints);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-base font-bold text-foreground">할인 / 포인트</h2>
      <div className="space-y-5">

        {/* 쿠폰 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">쿠폰</Label>
          {appliedCoupon ? (
            <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-green-700">{appliedCoupon.name}</p>
                <p className="text-xs text-green-600">
                  -{appliedCoupon.discountAmount.toLocaleString()}원 할인
                </p>
              </div>
              <button
                onClick={onCouponRemove}
                className="rounded-full p-1 text-green-500 hover:bg-green-100"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                value={couponInput}
                onChange={(e) => {
                  setCouponInput(e.target.value.toUpperCase());
                  setCouponError(null);
                }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCouponApply(); } }}
                placeholder="쿠폰 코드 입력"
                className={couponError ? "border-red-300 focus-visible:ring-red-300" : ""}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleCouponApply}
                disabled={couponLoading || !couponInput.trim()}
                className="shrink-0"
              >
                {couponLoading ? "확인 중..." : "적용"}
              </Button>
            </div>
          )}
          {couponError && <p className="text-xs text-red-500">{couponError}</p>}
        </div>

        {/* 포인트 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700">포인트 사용</Label>
            <span className="text-xs text-gray-500">
              보유 <span className="font-semibold text-gray-700">{userPoints.toLocaleString()}P</span>
            </span>
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              inputMode="numeric"
              value={pointsToUse === 0 ? "" : pointsToUse.toLocaleString()}
              onChange={(e) => handlePointsInput(e.target.value)}
              placeholder="0"
              disabled={userPoints === 0}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleUseAllPoints}
              disabled={userPoints === 0}
              className="shrink-0"
            >
              전액 사용
            </Button>
          </div>
          {pointsToUse > 0 && (
            <p className="text-xs text-brand-blue">-{pointsToUse.toLocaleString()}원 차감</p>
          )}
          {userPoints === 0 && (
            <p className="text-xs text-gray-400">사용 가능한 포인트가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
