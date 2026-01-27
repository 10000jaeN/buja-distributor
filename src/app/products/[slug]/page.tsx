import Image from "next/image";
import { redirect } from "next/navigation";

import noImage from "@/public/images/no-image.png";
import { productService } from "@/api/productService";
import { StarIcon } from "@/assets";

interface Props {
  params: Promise<{ slug: string }>;
}

const productsDetailPage = async ({ params }: Props) => {
  const { slug } = await params;

  const product = await productService.getProductBySlug(slug);

  if (!slug || slug === "undefined") {
    redirect("/error404");
  }

  return (
    <main>
      <Image
        src={product?.thumbnail[0] || noImage}
        alt="thumbnail"
        className="w-full"
      />
      <div className="mx-4 mt-5">
        <div aria-label="별점" className="flex items-center gap-3">
          <StarIcon className="text-amber-300" />
          <p className="text-lg text-gray-500">
            {product?.stats.ratingAverage} ｜ 후기 {product?.stats.reviewCount}
            개
          </p>
        </div>
        <p className="my-2 text-xl font-bold">{product?.name}</p>

        <div className="flex items-center gap-10">
          <p>판매가</p>
          <p className="text-xl font-semibold">
            {product?.price.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-10">
          <p>배송비</p>
          <p className="text-lg">3000원</p>
        </div>
      </div>

      <div
        aria-label="ToolBar"
        className="sticky top-0 flex justify-between border-b-1 border-gray-300 px-4 py-2"
      >
        <button>상세정보</button>
        <button>Q&A</button>
        <button>+ 장바구니</button>
        <button>구매하기</button>
      </div>

      {product?.contentBlock.map((content) => {
        if (content.type === "image") {
          return (
            <Image src={content.value} alt="상세페이지" className="w-full" />
          );
        } else if (content.type === "text") {
          return (
            <div className="flex items-center justify-center">
              {content.value}
            </div>
          );
        } else {
          return null;
        }
      })}
    </main>
  );
};

export default productsDetailPage;
