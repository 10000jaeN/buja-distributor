"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import { Product } from "@/types/product";
import noImage from "@/public/images/no-image.png";
import { CartInIcon } from "@/assets";
import useAuthStore from "@/store/useAuthStore";
import useCartStore from "@/store/useCartStore";
import { cartService } from "@/api/cartService";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

interface Props {
  product: Product;
  size?: "sm" | "lg";
  priority?: boolean;
}

export default function ProductCard({ product, size = "lg", priority = false }: Props) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const incrementCart = useCartStore((state) => state.increment);
  const router = useRouter();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [cartModalOpen, setCartModalOpen] = useState(false);

  const handleAddToCart = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isLoggedIn) {
        setLoginModalOpen(true);
        return;
      }
      try {
        await cartService.addToCart(product._id, 1);
        incrementCart(1);
        setCartModalOpen(true);
      } catch {
        // TODO: 에러 처리
      }
    },
    [isLoggedIn, incrementCart, product._id],
  );

  const isLg = size === "lg";

  return (
    <>
      <ConfirmDialog
        open={loginModalOpen}
        onOpenChange={setLoginModalOpen}
        title="로그인이 필요합니다"
        description="이 기능을 사용하려면 로그인이 필요합니다."
        confirmLabel="로그인하러 가기"
        onConfirm={() => router.push("/login")}
      />
      <ConfirmDialog
        open={cartModalOpen}
        onOpenChange={setCartModalOpen}
        title="장바구니에 담았습니다"
        description="장바구니로 이동하시겠습니까?"
        confirmLabel="장바구니 보기"
        onConfirm={() => router.push("/cart")}
      />

      <Link href={`/products/${product.slug}`} className={isLg ? "group block" : "block"}>
        {/* 이미지 영역 */}
        <div
          className={`relative overflow-hidden ${
            isLg
              ? "rounded-xl border border-gray-100"
              : "rounded-lg"
          }`}
        >
          <Image
            src={product.thumbnail[0] ?? noImage}
            alt={product.name}
            width={isLg ? 300 : 240}
            height={isLg ? 300 : 240}
            sizes={isLg ? undefined : "45vw"}
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            className={
              isLg
                ? "h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-52 md:h-60 lg:h-56"
                : "h-auto w-full"
            }
          />

          {/* 품절 오버레이 */}
          {!product.isAvailable && (
            <div className="absolute inset-0 flex items-end justify-start bg-black/10 pb-10 pl-2">
            </div>
          )}

          {/* 장바구니 담기 버튼 */}
          <button
            onClick={handleAddToCart}
            disabled={!product.isAvailable}
            className="absolute right-2 bottom-2 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 transition-colors hover:border-brand-blue hover:bg-brand-blue hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CartInIcon className="h-4 w-4" />
          </button>
        </div>

        {/* 텍스트 영역 */}
        <div className={`mt-2.5 space-y-1 ${isLg ? "px-0.5" : ""}`}>
          <p
            className={
              isLg
                ? "line-clamp-2 text-sm font-medium text-gray-800 group-hover:text-brand-blue"
                : "text-[14px] text-gray-800"
            }
          >
            {product.name}
          </p>
          <p className={isLg ? "text-sm font-bold text-gray-900" : "text-[12px] font-bold text-gray-900"}>
            {product.price.toLocaleString()}원
          </p>
          {!product.isAvailable && (
            <span className="text-xs text-gray-400">품절</span>
          )}
        </div>
      </Link>
    </>
  );
}
