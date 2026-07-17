"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { couponService, UserCoupon } from "@/api/couponService";
import { ChevronDown } from "lucide-react";

type Props = {
  userPoints: number;
  pointsToUse: number;
  onPointsChange: (v: number) => void;
  selectedUserCouponId: string | null;
  onCouponSelect: (userCouponId: string | null) => void;
  subtotal: number;
};

export default function CheckoutDiscountSection({
  userPoints,
  pointsToUse,
  onPointsChange,
  selectedUserCouponId,
  onCouponSelect,
  subtotal,
}: Props) {
  const [myCoupons, setMyCoupons] = useState<UserCoupon[]>([]);
  const [couponOpen, setCouponOpen] = useState(false);

  useEffect(() => {
    couponService.getMyCoupons("available").then(setMyCoupons).catch(() => {});
  }, []);

  // 현재 주문 금액에 적용 가능한 쿠폰만 필터
  const applicableCoupons = myCoupons.filter((uc) => {
    const c = uc.coupon;
    if (!c.isActive) return false;
    if (c.expiresAt && new Date(c.expiresAt) < new Date()) return false;
    if (c.minOrderAmount && subtotal < c.minOrderAmount) return false;
    return true;
  });

  const selectedCoupon = myCoupons.find((uc) => uc._id === selectedUserCouponId);

  const handlePointsInput = (value: string) => {
    const num = parseInt(value.replace(/\D/g, ""), 10);
    if (isNaN(num) || num < 0) onPointsChange(0);
    else onPointsChange(Math.min(num, userPoints));
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-base font-bold text-foreground">할인 / 포인트</h2>
      <div className="space-y-5">

        {/* 쿠폰 선택 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">쿠폰 선택</Label>
          {myCoupons.length === 0 ? (
            <p className="text-sm text-gray-400">보유한 쿠폰이 없습니다.</p>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setCouponOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-700 hover:border-gray-300"
              >
                <span>
                  {selectedCoupon
                    ? `${selectedCoupon.coupon.name} (${selectedCoupon.coupon.type === "percentage" ? `${selectedCoupon.coupon.value}%` : `${selectedCoupon.coupon.value.toLocaleString()}원`} 할인)`
                    : "쿠폰을 선택해주세요"}
                </span>
                <ChevronDown className={`size-4 text-gray-400 transition-transform ${couponOpen ? "rotate-180" : ""}`} />
              </button>

              {couponOpen && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
                  {/* 선택 해제 */}
                  <button
                    type="button"
                    onClick={() => { onCouponSelect(null); setCouponOpen(false); }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-400 hover:bg-gray-50"
                  >
                    적용 안 함
                  </button>
                  {applicableCoupons.length === 0 ? (
                    <p className="px-4 py-2.5 text-sm text-gray-400">현재 주문에 적용 가능한 쿠폰이 없습니다.</p>
                  ) : (
                    applicableCoupons.map((uc) => {
                      const c = uc.coupon;
                      const discountLabel = c.type === "percentage"
                        ? `${c.value}%${c.maxDiscount ? ` (최대 ${c.maxDiscount.toLocaleString()}원)` : ""}`
                        : `${c.value.toLocaleString()}원`;
                      return (
                        <button
                          key={uc._id}
                          type="button"
                          onClick={() => { onCouponSelect(uc._id); setCouponOpen(false); }}
                          className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 ${selectedUserCouponId === uc._id ? "bg-blue-50" : ""}`}
                        >
                          <p className="text-sm font-medium text-gray-800">{c.name}</p>
                          <p className="text-xs text-gray-500">
                            {discountLabel} 할인
                            {c.minOrderAmount ? ` · ${c.minOrderAmount.toLocaleString()}원 이상` : ""}
                            {c.expiresAt ? ` · ~${new Date(c.expiresAt).toLocaleDateString("ko-KR")}` : ""}
                          </p>
                        </button>
                      );
                    })
                  )}
                  {/* 적용 불가 쿠폰 */}
                  {myCoupons.filter((uc) => !applicableCoupons.includes(uc)).map((uc) => (
                    <div key={uc._id} className="px-4 py-2.5 opacity-40">
                      <p className="text-sm text-gray-600">{uc.coupon.name}</p>
                      <p className="text-xs text-gray-400">
                        {uc.coupon.minOrderAmount && subtotal < uc.coupon.minOrderAmount
                          ? `${uc.coupon.minOrderAmount.toLocaleString()}원 이상 주문 시 사용 가능`
                          : "적용 불가"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
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
              onClick={() => onPointsChange(userPoints)}
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
