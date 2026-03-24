"use client";

import Image from "next/image";
import Link from "next/link";

import { Product } from "@/types/product";
import noImage from "@/public/images/no-image.png";
import { CartInIcon } from "@/assets";
import useAuthStore from "@/store/useAuthStore";

const ProductList = ({
  products,
  title,
}: {
  products: Product[];
  title: string;
}) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Link의 기본 동작(페이지 이동) 방지
    e.stopPropagation(); // 부모 요소로 이벤트 전파 차단

    if (!isLoggedIn) {
      alert("로그인이 필요합니다."); // toast UI로 대체 예정
      return;
    }

    console.log("장바구니 담기 로직 실행");
    // 여기에 스토어 액션이나 API 호출 추가
  };

  return (
    <>
      <p className="my-8 flex justify-center text-2xl font-bold">{title}</p>
      <ul
        aria-label="지금 가장 인기있는 상품 목록"
        className="no-scrollbar mx-auto flex snap-x scroll-pl-4 gap-4 overflow-auto pr-[70vw] pl-4 whitespace-nowrap"
      >
        {products &&
          products.map((product) => (
            <li
              key={product.name}
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
    </>
  );
};

export default ProductList;
