"use client";

import { useCallback, useEffect, useState } from "react";
import { couponService, UserCoupon } from "@/api/couponService";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Ticket } from "lucide-react";

function formatDate(iso: string | null) {
  if (!iso) return "무기한";
  return new Date(iso).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

export default function MypageCouponsSection() {
  const [coupons, setCoupons] = useState<UserCoupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [codeInput, setCodeInput] = useState("");
  const [isClaiming, setIsClaiming] = useState(false);

  const fetchCoupons = useCallback(() => {
    setIsLoading(true);
    couponService.getMyCoupons()
      .then(setCoupons)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const handleClaim = async () => {
    if (!codeInput.trim()) return;
    setIsClaiming(true);
    try {
      const res = await couponService.claim(codeInput.trim());
      toast.success(res.message);
      setCodeInput("");
      fetchCoupons();
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "쿠폰 등록에 실패했습니다.";
      toast.error(msg);
    } finally {
      setIsClaiming(false);
    }
  };

  const available = coupons.filter((uc) => uc.status === "available");
  const used = coupons.filter((uc) => uc.status === "used");

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <Ticket className="size-4 text-brand-blue" />
        <h2 className="text-base font-bold text-gray-900">쿠폰함</h2>
        <span className="rounded-full bg-brand-blue px-2 py-0.5 text-xs font-semibold text-white">
          {available.length}
        </span>
      </div>

      {/* 쿠폰 코드 등록 */}
      <div className="mb-5">
        <p className="mb-2 text-xs font-medium text-gray-400">쿠폰 코드 등록</p>
        <div className="flex gap-2">
          <Input
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleClaim(); } }}
            placeholder="쿠폰 코드를 입력하세요"
            disabled={isClaiming}
          />
          <Button
            onClick={handleClaim}
            disabled={isClaiming || !codeInput.trim()}
            className="shrink-0"
          >
            {isClaiming ? "등록 중..." : "등록"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-brand-blue" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-gray-200 text-sm text-gray-400">
          보유한 쿠폰이 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {/* 사용 가능 */}
          {available.length > 0 && (
            <div className="space-y-2">
              {available.map((uc) => {
                const c = uc.coupon;
                const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
                return (
                  <div
                    key={uc._id}
                    className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
                      expired ? "border-gray-100 bg-gray-50 opacity-60" : "border-brand-blue/20 bg-blue-50/40"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {c.type === "percentage"
                          ? `${c.value}%${c.maxDiscount ? ` (최대 ${c.maxDiscount.toLocaleString()}원)` : ""} 할인`
                          : `${c.value.toLocaleString()}원 할인`}
                        {c.minOrderAmount ? ` · ${c.minOrderAmount.toLocaleString()}원 이상` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${expired ? "bg-gray-100 text-gray-400" : "bg-brand-blue/10 text-brand-blue"}`}>
                        {expired ? "만료" : "사용 가능"}
                      </span>
                      <p className="mt-1 text-[11px] text-gray-400">{formatDate(c.expiresAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 사용 완료 */}
          {used.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-400">사용 완료</p>
              {used.map((uc) => (
                <div
                  key={uc._id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 opacity-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-600">{uc.coupon.name}</p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {uc.usedAt ? new Date(uc.usedAt).toLocaleDateString("ko-KR") : ""} 사용
                    </p>
                  </div>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-400">
                    사용됨
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
