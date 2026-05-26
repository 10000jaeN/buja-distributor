"use client";

import { useRef, useEffect, useMemo, useCallback } from "react";

import { Product } from "@/types/product";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/shared/ProductCard";

const ProductList = ({
  products,
  title,
}: {
  products: Product[];
  title: string;
}) => {
  const scrollRef = useRef<HTMLUListElement>(null);
  const itemWidthRef = useRef<number>(0);

  const tripled = useMemo(
    () => [...products, ...products, ...products],
    [products],
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
      <div className="relative lg:px-12">
        <p className="my-8 flex justify-center text-2xl font-bold">{title}</p>
        <button
          type="button"
          onClick={scrollPrev}
          className="absolute top-1/2 left-0 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow-md hover:border-brand-blue hover:bg-brand-blue hover:text-white lg:flex"
        >
          <ChevronLeft className="h-5 w-5" />
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
              className="mx-auto mb-4 w-[40vw] shrink-0 snap-start transition-normal md:w-[30vw] lg:w-55"
            >
              <ProductCard product={product} size="sm" priority={idx < 3} />
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={scrollNext}
          className="absolute top-1/2 right-0 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow-md hover:border-brand-blue hover:bg-brand-blue hover:text-white lg:flex"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </>
  );
};

export default ProductList;
