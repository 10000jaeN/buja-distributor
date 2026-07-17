"use client";

import { cartService } from "@/api/cartService";
import useAuthStore from "@/store/useAuthStore";
import useCartStore from "@/store/useCartStore";
import useCheckoutStore from "@/store/useCheckoutStore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ProductBottomSheet } from "./ProductBottomSheet";

type Props = {
  productId: string;
  price: number;
  shippingFee: number;
  freeShippingThreshold: number;
  thumbnail: string;
  name: string;
  stock: number | null;
  isAvailable: boolean;
};

export function ProductActions({
  productId,
  price,
  shippingFee,
  freeShippingThreshold,
  thumbnail,
  name,
  stock,
  isAvailable,
}: Props) {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const incrementCart = useCartStore((state) => state.increment);
  const setCheckout = useCheckoutStore((state) => state.setCheckout);
  const router = useRouter();

  const subtotal = price * quantity;
  const isFreeShipping =
    freeShippingThreshold > 0 && subtotal >= freeShippingThreshold;
  const appliedShippingFee = isFreeShipping ? 0 : shippingFee;
  const totalPrice = subtotal + appliedShippingFee;

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    if (isBuying) return;
    setIsBuying(true);
    setIsSheetOpen(false);
    setCheckout(
      [{ productId, name, price, quantity, shippingFee: appliedShippingFee, bundleShipping: false, thumbnail }],
      appliedShippingFee,
      totalPrice
    );
    router.push("/checkout");
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setIsLoading(true);
    try {
      await cartService.addToCart(productId, quantity);
      incrementCart(1);
      setIsSheetOpen(false);
      toast.success("장바구니에 담았습니다.", {
        action: { label: "장바구니 보기", onClick: () => router.push("/cart") },
      });
    } catch {
      toast.error("장바구니 담기에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* PC */}
      <div className="mt-6 hidden lg:block">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-gray-500">수량</span>
          <div className="flex items-center gap-3">
            <button
              aria-label="수량 감소"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30"
              disabled={quantity <= 1}
            >
              -
            </button>
            <span className="min-w-[28px] text-center text-base font-medium text-gray-800">
              {quantity}
            </span>
            <button
              aria-label="수량 증가"
              onClick={() => setQuantity((q) => (stock !== null && isAvailable ? Math.min(stock, q + 1) : q + 1))}
              disabled={stock !== null && isAvailable && quantity >= stock}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30"
            >
              +
            </button>
          </div>
        </div>
        {stock !== null && quantity >= stock && (
          <p className="mt-2 text-xs text-gray-400 text-right">추가 구매를 원하시면 문의해 주세요.</p>
        )}

        <div className="mt-4 space-y-2 rounded-xl bg-gray-50 px-4 py-3">
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

        <div className="mt-4 flex gap-3">
          <button
            onClick={handleAddToCart}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-gray-300 bg-white py-4 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            장바구니
          </button>
          <button
            onClick={handleBuyNow}
            disabled={isBuying || !isAvailable}
            className="bg-brand-blue flex-1 rounded-xl py-4 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50"
          >
            {!isAvailable ? "품절" : "구매하기"}
          </button>
        </div>
      </div>

      {/* 모바일 하단 고정 바 */}
      <nav
        aria-label="구매 바"
        className="fixed bottom-0 left-0 z-40 w-full border-t border-gray-200 bg-white px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-2px_8px_rgba(0,0,0,0.06)] lg:hidden"
      >
        <button
          onClick={() => setIsSheetOpen(true)}
          className="bg-brand-blue w-full rounded-xl py-4 text-sm font-semibold text-white transition-colors hover:opacity-90"
        >
          구매하기
        </button>
      </nav>

      {/* 바텀시트 */}
      <ProductBottomSheet
        open={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        thumbnail={thumbnail}
        name={name}
        stock={stock}
        isAvailable={isAvailable}
        quantity={quantity}
        appliedShippingFee={appliedShippingFee}
        freeShippingThreshold={freeShippingThreshold}
        isFreeShipping={isFreeShipping}
        totalPrice={totalPrice}
        onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
        onIncrease={() =>
          setQuantity((q) => (stock !== null ? Math.min(stock, q + 1) : q + 1))
        }
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        isCartLoading={isLoading}
        isBuying={isBuying}
      />
    </>
  );
}
