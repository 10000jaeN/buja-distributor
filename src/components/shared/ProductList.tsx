"use client";

import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Product } from "@/types/product";
import noImage from "@/public/images/no-image.png";
import { CartInIcon, ArrowIcon } from "@/assets";
import useAuthStore from "@/store/useAuthStore";
import useCartStore from "@/store/useCartStore";
import { cartService } from "@/api/cartService";
import ConfirmDialog from "@/components/common/ConfirmDialog";

const ProductList = ({
  products,
  title,
}: {
  products: Product[];
  title: string;
}) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const incrementCart = useCartStore((state) => state.increment);
  const router = useRouter();
  const scrollRef = useRef<HTMLUListElement>(null);
  const itemWidthRef = useRef<number>(0);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [cartModalOpen, setCartModalOpen] = useState(false);

  const tripled = useMemo(
    () => [...products, ...products, ...products],
    [products],
  );

  const handleAddToCart = useCallback(
    async (e: React.MouseEvent, productId: string) => {
      e.preventDefault();
      e.stopPropagation();

      if (!isLoggedIn) {
        setLoginModalOpen(true);
        return;
      }

      try {
        await cartService.addToCart(productId, 1);
        incrementCart(1);
        setCartModalOpen(true);
      } catch {
        // TODO: 에러 처리
      }
    },
    [isLoggedIn, incrementCart],
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = el.scrollWidth / 3;
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const firstItem = el.firstElementChild as HTMLElement;
    if (!firstItem) return;

    const observer = new ResizeObserver(() => {
      itemWidthRef.current = firstItem.offsetWidth + 16; // gap-4 = 16px
    });
    observer.observe(firstItem);
    return () => observer.disconnect();
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const third = el.scrollWidth / 3;
    if (el.scrollLeft >= third * 2) {
      el.scrollLeft -= third;
    } else if (el.scrollLeft < third) {
      el.scrollLeft += third;
    }
  }, []);

  const scrollPrev = useCallback(() => {
    scrollRef.current?.scrollBy({
      left: -itemWidthRef.current,
      behavior: "smooth",
    });
  }, []);

  const scrollNext = useCallback(() => {
    scrollRef.current?.scrollBy({
      left: itemWidthRef.current,
      behavior: "smooth",
    });
  }, []);

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
      <div className="relative lg:px-12">
        <p className="my-8 flex justify-center text-2xl font-bold">{title}</p>
        <button
          type="button"
          onClick={scrollPrev}
          className="absolute top-1/2 left-0 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow-md hover:border-brand-blue hover:bg-brand-blue hover:text-white lg:flex"
        >
          <ArrowIcon className="rotate-180 fill-current" />
        </button>

        <ul
          ref={scrollRef}
          onScroll={handleScroll}
          aria-label={title}
          className="no-scrollbar mx-auto flex snap-x scroll-pl-2 gap-4 overflow-auto pr-[70vw] pl-4 whitespace-nowrap lg:scroll-pl-0 lg:px-12"
        >
          {tripled.map((product, idx) => (
            <li
              key={`${product._id}-${idx}`}
              className="mx-auto mb-4 flex w-[40vw] shrink-0 snap-start flex-col gap-1 transition-normal md:w-[30vw] lg:w-55"
            >
              <Link href={`/products/${product.slug}`} className="relative">
                <Image
                  src={product.thumbnail[0] || noImage}
                  alt="thumbnail"
                  width={240}
                  height={240}
                  sizes="45vw"
                  loading={idx < 3 ? "eager" : "lazy"}
                  className="mb-2 h-auto w-full rounded-lg"
                />
                <button
                  className="absolute right-3 bottom-5 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 hover:border-brand-blue hover:bg-brand-blue hover:text-white"
                  onClick={(e) => handleAddToCart(e, product._id)}
                >
                  <CartInIcon className="h-4 w-4" />
                </button>
              </Link>
              <div className="flex flex-col items-start gap-1 text-[14px]">
                <div>{product.name}</div>
                <div className="text-[12px] font-bold">
                  {product.price.toLocaleString()}원
                </div>
              </div>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={scrollNext}
          className="absolute top-1/2 right-0 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow-md hover:border-brand-blue hover:bg-brand-blue hover:text-white lg:flex"
        >
          <ArrowIcon className="fill-current" />
        </button>
      </div>
    </>
  );
};

export default ProductList;
