"use client";

import { cartService, CartItem } from "@/api/cartService";
import useAuthStore from "@/store/useAuthStore";
import useCartStore from "@/store/useCartStore";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import noImage from "@/public/images/no-image.png";

export default function CartPage() {
  const { isLoggedIn, isInitialized } = useAuthStore();
  const [items, setItems] = useState<CartItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const setCartCount = useCartStore((state) => state.setCount);

  // items 변경 시 nav 뱃지 카운트 동기화
  useEffect(() => {
    if (!isLoading) {
      setCartCount(items.length);
    }
  }, [items, isLoading, setCartCount]);

  useEffect(() => {
    setIsLoading(true);
    cartService
      .getCart()
      .then((cart) => {
        setItems(cart.items);
        setSelected(new Set(cart.items.map((i) => i.productId._id)));
      })
      .catch(() => setError("장바구니를 불러오지 못했습니다."))
      .finally(() => setIsLoading(false));
  }, []);

  const isAllSelected = items.length > 0 && selected.size === items.length;

  const toggleAll = () => {
    if (isAllSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map((i) => i.productId._id)));
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
      prev.map((i) => (i.productId._id === productId ? { ...i, quantity } : i)),
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

    setItems((prev) => prev.filter((i) => !productIds.includes(i.productId._id)));
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

  const selectedItems = items.filter((i) => selected.has(i.productId._id));
  const selectedTotal = selectedItems.reduce(
    (sum, i) => sum + i.productId.price * i.quantity,
    0,
  );

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
            <p className="text-base font-medium text-gray-700">로그인이 필요한 서비스입니다.</p>
            <p className="text-sm text-gray-400">로그인하고 장바구니를 이용해보세요.</p>
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
                  전체 선택 ({selected.size}/{items.length})
                </span>
              </label>
              {selected.size > 0 && (
                <button
                  onClick={() => handleRemove([...selected])}
                  className="text-sm text-gray-400 hover:text-red-500"
                >
                  선택 삭제
                </button>
              )}
            </div>

            {/* 아이템 */}
            <div className="space-y-3">
              {items.map((item) => {
                const product = item.productId;
                const isSelected = selected.has(product._id);
                return (
                  <div
                    key={product._id}
                    className={`flex items-center gap-4 rounded-xl border bg-white px-4 py-4 shadow-sm transition-colors ${isSelected ? "border-brand-blue/30" : "border-gray-100"}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleItem(product._id)}
                      className="accent-brand-blue h-4 w-4 shrink-0 cursor-pointer"
                    />
                    <Link href={`/products/${product.slug}`} className="shrink-0">
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
                              handleQuantityChange(product._id, item.quantity - 1)
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
                              handleQuantityChange(product._id, item.quantity + 1)
                            }
                            className="px-3 py-1.5 text-gray-500 hover:text-gray-800"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemove([product._id])}
                          className="text-xs text-gray-400 hover:text-red-400"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 주문 요약 */}
          <div className="lg:w-72">
            <div className="sticky top-24 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-bold text-gray-900">주문 요약</h2>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>상품 금액</span>
                  <span>{selectedTotal.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span>배송비</span>
                  <span className="text-brand-blue">무료</span>
                </div>
              </div>
              <div className="my-4 border-t border-gray-100" />
              <div className="flex justify-between text-base font-bold text-gray-900">
                <span>총 결제 금액</span>
                <span className="text-brand-blue">
                  {selectedTotal.toLocaleString()}원
                </span>
              </div>
              <button
                disabled={selected.size === 0}
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
