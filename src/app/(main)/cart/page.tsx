"use client";

import { cartService, CartItem } from "@/api/cartService";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import noImage from "@/public/images/no-image.png";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const cart = await cartService.getCart();
      setItems(cart.items);
      setTotalAmount(cart.totalAmount);
      setSelected(new Set(cart.items.map((i) => i.productId._id)));
    } catch {
      setError("장바구니를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
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
    try {
      await cartService.updateCartItem(productId, quantity);
      await fetchCart();
    } catch {
      alert("수량 변경에 실패했습니다.");
    }
  };

  const handleRemove = async (productIds: string[]) => {
    try {
      await cartService.removeCartItems(productIds);
      setSelected((prev) => {
        const next = new Set(prev);
        productIds.forEach((id) => next.delete(id));
        return next;
      });
      await fetchCart();
    } catch {
      alert("삭제에 실패했습니다.");
    }
  };

  const selectedItems = items.filter((i) => selected.has(i.productId._id));
  const selectedTotal = selectedItems.reduce(
    (sum, i) => sum + i.productId.price * i.quantity,
    0,
  );

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
                        width={80}
                        height={80}
                        className="h-20 w-20 rounded-lg border border-gray-100 object-cover"
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
