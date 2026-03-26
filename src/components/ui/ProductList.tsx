"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { Product } from "@/types/product";
import noImage from "@/public/images/no-image.png";
import { CartInIcon, ArrowIcon } from "@/assets";
import useAuthStore from "@/store/useAuthStore";

const ProductList = ({
  products,
  title,
}: {
  products: Product[];
  title: string;
}) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const scrollRef = useRef<HTMLUListElement>(null);
  const tripled = [...products, ...products, ...products];
  const [loginRequired, setLoginRequired] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      setLoginRequired(true);
      setTimeout(() => setLoginRequired(false), 2500);
      return;
    }

    console.log("장바구니 담기 로직 실행");
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = el.scrollWidth / 3;
  }, []);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const third = el.scrollWidth / 3;
    if (el.scrollLeft >= third * 2) {
      el.scrollLeft -= third;
    } else if (el.scrollLeft < third) {
      el.scrollLeft += third;
    }
  };

  const getItemWidth = () => {
    const el = scrollRef.current;
    if (!el) return 0;
    const firstItem = el.firstElementChild as HTMLElement;
    if (!firstItem) return 0;
    return firstItem.offsetWidth + 16; // gap-4 = 16px
  };

  const scrollPrev = () => {
    scrollRef.current?.scrollBy({ left: -getItemWidth(), behavior: "smooth" });
  };

  const scrollNext = () => {
    scrollRef.current?.scrollBy({ left: getItemWidth(), behavior: "smooth" });
  };

  return (
    <>
      {loginRequired && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-gray-800 px-4 py-2 text-sm text-white shadow-lg">
          로그인이 필요합니다.
        </div>
      )}
      <div className="relative lg:px-12">
        <p className="my-8 flex justify-center text-2xl font-bold">{title}</p>
        <button
          type="button"
          onClick={scrollPrev}
          className="absolute top-1/2 left-0 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-gray-800 shadow-md hover:bg-gray-100 lg:flex"
        >
          <ArrowIcon className="rotate-180 fill-white" />
        </button>

        <ul
          ref={scrollRef}
          onScroll={handleScroll}
          aria-label={title}
          className="no-scrollbar mx-auto flex snap-x scroll-pl-2 gap-4 overflow-auto pr-[70vw] pl-4 whitespace-nowrap lg:scroll-pl-0 lg:px-12"
        >
          {tripled.map((product, idx) => (
            <li
              key={`${product.name}-${idx}`}
              className="mx-auto mb-4 flex w-[40vw] shrink-0 snap-start flex-col gap-1 transition-normal md:w-[30vw] lg:w-55"
            >
              <Link href={`/products/${product.slug}`} className="relative">
                <Image
                  src={product.thumbnail[0] || noImage}
                  alt="thumbnail"
                  width={240}
                  height={240}
                  sizes="45vw"
                  className="mb-2 h-auto w-full rounded-lg"
                />
                <button
                  className="absolute right-3 bottom-5 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-800 hover:bg-gray-200"
                  onClick={handleAddToCart}
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
          className="absolute top-1/2 right-0 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-gray-800 text-white shadow-md hover:bg-gray-100 lg:flex"
        >
          <ArrowIcon className="fill-white" />
        </button>
      </div>
    </>
  );
};

export default ProductList;
