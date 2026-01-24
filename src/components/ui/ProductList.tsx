"use client";

import Image from "next/image";
import Link from "next/link";

import { Product } from "@/types/product";
import noImage from "@/public/images/no-image.png";
import { CartInIcon } from "@/assets";
import useAuthStore from "@/store/useAuthStore";

const ProductList = ({ products }: { products: Product[] }) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  const handleAddToCart = (e: React.MouseEvent) => {
    if (!isLoggedIn) return alert("로그인이 필요합니다.");
    e.preventDefault(); // Link의 기본 동작(페이지 이동) 방지
    e.stopPropagation(); // 부모 요소로 이벤트 전파 차단

    console.log("장바구니 담기 로직 실행");
    // 여기에 스토어 액션이나 API 호출 추가
  };

  return (
    <>
      {products &&
        products.map((product) => (
          <li
            key={product._id}
            className="mx-auto mb-4 flex w-[45vw] flex-col gap-1 transition-normal duration-100 md:w-[30vw]"
          >
            <Link href={`/products/${product.slug}`} className="relative">
              <Image
                src={product.thumbnail[0] || noImage}
                alt="thumbnail"
                width={0}
                height={0}
                sizes="45vw"
                className="mb-2 h-auto w-full rounded-lg"
              />
              <button
                className="absolute right-3 bottom-5 z-10"
                onClick={handleAddToCart}
              >
                <CartInIcon />
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
    </>
  );
};

export default ProductList;
