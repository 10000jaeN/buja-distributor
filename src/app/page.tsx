import Image from "next/image";
import Link from "next/link";

import axiosInstance from "@/lib/axios";
import noImage from "@/public/images/no-image.png";
import { Product } from "@/types/product";

export default async function Home() {
  const getProducts = async (): Promise<Product[]> => {
    const { data } = await axiosInstance.get<Product[]>("/products");
    return data;
  };

  const products = await getProducts();

  return (
    <div className="mx-3 mt-1">
      <Link
        href="/login"
        className="rounded-lg border bg-amber-200 p-1 font-bold"
      >
        로그인 버튼(임시)
      </Link>

      <div className="relative">
        <div className="overflow-hidden">
          <div className="flex">{}</div>
        </div>
      </div>

      <div>
        <div className="mb-3 text-[20px] font-bold">
          🎁 지금 가장 인기있는 상품
        </div>
        <ul
          aria-label="지금 가장 인기있는 상품 목록"
          className="mx-auto grid grid-cols-2 justify-between md:grid-cols-3"
        >
          {products &&
            products.map((product) => (
              <li
                key={product._id}
                className="mx-auto mb-4 flex w-[45vw] flex-col gap-2 transition-normal duration-100 md:w-[30vw]"
              >
                <Image
                  src={noImage}
                  alt="상품 메인 이미지"
                  width={0}
                  height={0}
                  sizes="45vw"
                  className="h-auto w-full rounded-lg"
                />
                <div className="flex flex-col items-start text-[12px]">
                  <div>{product.name}</div>
                  <div className="text-[12px] font-bold">
                    {product.price.toLocaleString()}원
                  </div>
                </div>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
