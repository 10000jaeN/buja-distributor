"use client";

import { cartService, CartItem } from "@/api/cartService";
import { Product } from "@/types/product";
import { settingsService } from "@/api/settingsService";
import useAuthStore from "@/store/useAuthStore";
import useCartStore from "@/store/useCartStore";
import useCheckoutStore from "@/store/useCheckoutStore";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import noImage from "@/public/images/no-image.png";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

export default function CartPage() {
  const router = useRouter();
  const { isLoggedIn, isInitialized } = useAuthStore();
  const setCheckout = useCheckoutStore((s) => s.setCheckout);
  const [items, setItems] = useState<CartItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const setCartCount = useCartStore((state) => state.setCount);
  const [removeTarget, setRemoveTarget] = useState<string[] | null>(null);
  const [bundleFreeThreshold, setBundleFreeThreshold] = useState(50000);

  // items 변경 시 nav 뱃지 카운트 동기화
  useEffect(() => {
    if (!isLoading) {
      setCartCount(items.length);
    }
  }, [items, isLoading, setCartCount]);

  useEffect(() => {
    Promise.all([
      cartService.getCart(),
      settingsService.getSettings(),
    ])
      .then(([cart, settings]) => {
        setItems(cart.items);
        setSelected(new Set(cart.items.filter((i) => i.productId !== null).map((i) => i.productId!._id)));
        setBundleFreeThreshold(settings.bundleFreeThreshold);
      })
      .catch(() => setError("장바구니를 불러오지 못했습니다."))
      .finally(() => setIsLoading(false));
  }, []);

  type ValidItem = Omit<CartItem, "productId"> & { productId: Product };
  const validItems = items.filter((i): i is ValidItem => i.productId !== null);
  const deletedItems = items.filter((i) => i.productId === null);
  const isAllSelected = validItems.length > 0 && selected.size === validItems.length;

  const toggleAll = () => {
    if (isAllSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(validItems.map((i) => i.productId._id)));
    }
  };

  const toggleItem = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleQuantityChange = async (productId: string, quantity: number) => {
    if (quantity < 1) return;

    const prevItems = items;
    setItems((prev) =>
      prev.map((i) => (i.productId?._id === productId ? { ...i, quantity } : i)),
    );

    try {
      await cartService.updateCartItem(productId, quantity);
    } catch {
      setItems(prevItems);
      toast.error("수량 변경에 실패했습니다.");
    }
  };

  const handleRemove = async (productIds: string[]) => {
    const prevItems = items;
    const prevSelected = selected;

    setItems((prev) =>
      prev.filter((i) => {
        if (i.productId === null) {
          // deletedProductId가 없으면 제거 불가 → 유지
          return !i.deletedProductId || !productIds.includes(i.deletedProductId);
        }
        return !productIds.includes(i.productId._id);
      }),
    );
    setSelected((prev) => {
      const next = new Set(prev);
      productIds.forEach((id) => next.delete(id));
      return next;
    });

    try {
      await cartService.removeCartItems(productIds);
    } catch {
      setItems(prevItems);
      setSelected(prevSelected);
      toast.error("삭제에 실패했습니다.");
    }
  };

  const selectedItems = validItems.filter((i) => selected.has(i.productId._id));
  const selectedTotal = selectedItems.reduce(
    (sum, i) => sum + i.productId.price * i.quantity,
    0,
  );

  const bundleItems = selectedItems.filter((i) => i.productId.bundleShipping);
  const nonBundleItems = selectedItems.filter((i) => !i.productId.bundleShipping);

  const nonBundleShipping = nonBundleItems.reduce((sum, i) => {
    return sum + (i.productId.shippingFee ?? 0);
  }, 0);

  const bundleSubtotal = bundleItems.reduce(
    (sum, i) => sum + i.productId.price * i.quantity,
    0,
  );
  const bundleShipping =
    bundleItems.length === 0 ? 0 :
    bundleSubtotal >= bundleFreeThreshold ? 0 :
    Math.max(...bundleItems.map((i) => i.productId.shippingFee ?? 0));

  const totalShipping = nonBundleShipping + bundleShipping;

  const handleCheckout = () => {
    if (selectedItems.length === 0) return;
    setCheckout(
      selectedItems.map((i) => ({
        productId: i.productId._id,
        name: i.productId.name,
        price: i.productId.price,
        quantity: i.quantity,
        shippingFee: i.productId.shippingFee ?? 0,
        bundleShipping: i.productId.bundleShipping ?? false,
        thumbnail: i.productId.thumbnail?.[0] ?? "",
      })),
      totalShipping,
      selectedTotal + totalShipping,
    );
    router.push("/checkout");
  };

  if (!isInitialized) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="border-t-brand-blue h-8 w-8 animate-spin rounded-full border-3 border-gray-200" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-[1024px] px-5 py-10">
        <h1 className="mb-8 text-2xl font-bold text-gray-900">장바구니</h1>
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-5">
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-base font-medium text-gray-700">
              로그인이 필요한 서비스입니다.
            </p>
            <p className="text-sm text-gray-400">
              로그인하고 장바구니를 이용해보세요.
            </p>
          </div>
          <Link
            href="/login"
            className="bg-brand-blue rounded-xl px-8 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="border-t-brand-blue h-8 w-8 animate-spin rounded-full border-3 border-gray-200" />
          <span className="text-sm text-gray-500">불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1024px] px-5 py-10">
      <ConfirmDialog
        open={removeTarget !== null}
        onOpenChange={(open) => { if (!open) setRemoveTarget(null); }}
        title="장바구니에서 삭제"
        description={
          removeTarget && removeTarget.length > 1
            ? `선택한 ${removeTarget.length}개 상품을 삭제하시겠습니까?`
            : "상품을 삭제하시겠습니까?"
        }
        confirmLabel="삭제"
        onConfirm={() => {
          if (removeTarget) handleRemove(removeTarget);
          setRemoveTarget(null);
        }}
      />
      <h1 className="mb-8 text-2xl font-bold text-gray-900">장바구니</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24">
          <p className="text-gray-400">장바구니가 비어있습니다.</p>
          <Link
            href="/"
            className="text-brand-blue text-sm font-semibold hover:underline"
          >
            쇼핑 계속하기
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* 아이템 목록 */}
          <div className="flex-1">
            {/* 전체 선택 */}
            <div className="mb-3 flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleAll}
                  className="accent-brand-blue h-4 w-4 cursor-pointer rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  전체 선택 ({selected.size}/{validItems.length})
                </span>
              </label>
              {selected.size > 0 && (
                <button
                  onClick={() => setRemoveTarget([...selected])}
                  className="text-sm text-gray-400 hover:text-red-500"
                >
                  선택 삭제
                </button>
              )}
            </div>

            {/* 아이템 */}
            <div className="space-y-3">
              {validItems.map((item) => {
                const product = item.productId;
                const isSelected = selected.has(product._id);
                return (
                  <div
                    key={`valid-${product._id}`}
                    className={`flex items-center gap-4 rounded-xl border bg-white px-4 py-4 shadow-sm transition-colors ${isSelected ? "border-brand-blue/30" : "border-gray-100"}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleItem(product._id)}
                      className="accent-brand-blue h-4 w-4 shrink-0 cursor-pointer"
                    />
                    <Link
                      href={`/products/${product.slug}`}
                      className="shrink-0"
                    >
                      <Image
                        src={product.thumbnail?.[0] ?? noImage}
                        alt={product.name}
                        width={96}
                        height={96}
                        className="h-24 w-24 rounded-lg border border-gray-100 object-cover"
                      />
                    </Link>
                    <div className="flex flex-1 flex-col gap-2">
                      <Link
                        href={`/products/${product.slug}`}
                        className="line-clamp-2 text-sm font-medium text-gray-800 hover:underline"
                      >
                        {product.name}
                      </Link>
                      <p className="text-brand-blue font-bold">
                        {(product.price * item.quantity).toLocaleString()}원
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center rounded-lg border border-gray-200">
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                product._id,
                                item.quantity - 1,
                              )
                            }
                            disabled={item.quantity <= 1}
                            className="px-3 py-1.5 text-gray-500 hover:text-gray-800 disabled:opacity-30"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                product._id,
                                item.quantity + 1,
                              )
                            }
                            className="px-3 py-1.5 text-gray-500 hover:text-gray-800"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => setRemoveTarget([product._id])}
                          className="text-xs text-gray-400 hover:text-red-400"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* 삭제된 상품 */}
              {deletedItems.map((item) => (
                <div
                  key={`deleted-${item.deletedProductId}`}
                  className="flex items-center gap-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-4 shadow-sm"
                >
                  {item.snapshot?.thumbnail ? (
                    <Image
                      src={item.snapshot.thumbnail}
                      alt={item.snapshot.name}
                      width={96}
                      height={96}
                      className="h-24 w-24 shrink-0 rounded-lg border border-gray-100 object-cover grayscale"
                    />
                  ) : (
                    <div className="h-24 w-24 shrink-0 rounded-lg bg-gray-100" />
                  )}
                  <div className="flex flex-1 flex-col gap-1.5">
                    <p className="line-clamp-2 text-sm font-medium text-gray-400 line-through">
                      {item.snapshot?.name ?? "삭제된 상품"}
                    </p>
                    <p className="text-xs text-gray-400">더 이상 판매하지 않는 상품입니다.</p>
                  </div>
                  <button
                    onClick={() => item.deletedProductId && setRemoveTarget([item.deletedProductId])}
                    disabled={!item.deletedProductId}
                    className="text-xs text-gray-400 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 주문 요약 */}
          <div className="sticky top-28 lg:w-72">
            <div className="sticky top-24 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-bold text-gray-900">
                주문 요약
              </h2>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>상품 금액</span>
                  <span>{selectedTotal.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span>배송비</span>
                  <span
                    className={totalShipping === 0 ? "text-brand-blue" : ""}
                  >
                    {totalShipping === 0
                      ? "무료"
                      : `${totalShipping.toLocaleString()}원`}
                  </span>
                </div>
              </div>
              <div className="my-4 border-t border-gray-100" />
              <div className="flex justify-between text-base font-bold text-gray-900">
                <span>총 결제 금액</span>
                <span className="text-brand-blue">
                  {(selectedTotal + totalShipping).toLocaleString()}원
                </span>
              </div>
              <button
                disabled={selected.size === 0}
                onClick={handleCheckout}
                className="bg-brand-blue mt-5 w-full rounded-xl py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {selected.size > 0
                  ? `${selected.size}개 상품 구매하기`
                  : "상품을 선택해주세요"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
