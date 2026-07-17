"use client";

import Image from "next/image";
import { useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  thumbnail: string;
  name: string;
  price: number;
  shippingFee: number;
  freeShippingThreshold: number;
  stock: number | null;
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  isCartLoading: boolean;
  isBuying: boolean;
};

export function ProductBottomSheet({
  open,
  onClose,
  thumbnail,
  name,
  price,
  shippingFee,
  freeShippingThreshold,
  stock,
  quantity,
  onDecrease,
  onIncrease,
  onAddToCart,
  onBuyNow,
  isCartLoading,
  isBuying,
}: Props) {
  const subtotal = price * quantity;
  const isFreeShipping =
    freeShippingThreshold > 0 && subtotal >= freeShippingThreshold;
  const appliedShippingFee = isFreeShipping ? 0 : shippingFee;
  const totalPrice = subtotal + appliedShippingFee;

  // 시트 열릴 때 body 스크롤 잠금
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* 백드롭 */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 바텀시트 */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-white shadow-xl transition-transform duration-300 ease-out lg:hidden ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        aria-modal="true"
        role="dialog"
      >
        {/* 드래그 핸들 */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-gray-200" />
        </div>

        <div className="px-5 pt-3 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          {/* 상품 정보 */}
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <Image
              src={thumbnail}
              alt={name}
              width={56}
              height={56}
              className="h-14 w-14 shrink-0 rounded-xl object-cover"
            />
            <p className="line-clamp-2 text-sm font-medium text-gray-800">
              {name}
            </p>
          </div>

          {/* 수량 선택 */}
          <div className="flex items-center justify-between py-5">
            <span className="text-sm text-gray-500">수량</span>
            <div className="flex items-center gap-3">
              <button
                aria-label="수량 감소"
                onClick={onDecrease}
                disabled={quantity <= 1}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30"
              >
                −
              </button>
              <span className="min-w-[28px] text-center text-base font-medium text-gray-800">
                {quantity}
              </span>
              <button
                aria-label="수량 증가"
                onClick={onIncrease}
                disabled={stock !== null && quantity >= stock}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>

          {stock !== null && quantity >= stock && (
            <p className="mb-3 text-right text-xs text-gray-400">
              추가 구매를 원하시면 문의해 주세요.
            </p>
          )}

          {/* 가격 요약 */}
          <div className="space-y-2 rounded-xl bg-gray-50 px-4 py-3">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>배송비</span>
              <span>
                {appliedShippingFee === 0 ? (
                  <span className="text-brand-blue font-medium">무료</span>
                ) : (
                  `${appliedShippingFee.toLocaleString()}원`
                )}
                {freeShippingThreshold > 0 && !isFreeShipping && (
                  <span className="ml-1 text-xs text-gray-400">
                    ({freeShippingThreshold.toLocaleString()}원 이상 무료)
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 pt-2">
              <span className="text-sm text-gray-500">총 결제금액</span>
              <span className="text-brand-blue text-xl font-bold">
                {totalPrice.toLocaleString()}원
              </span>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={onAddToCart}
              disabled={isCartLoading}
              className="flex-1 rounded-xl border border-gray-300 bg-white py-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              장바구니
            </button>
            <button
              onClick={onBuyNow}
              disabled={isBuying}
              className="bg-brand-blue flex-1 rounded-xl py-4 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              구매하기
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
