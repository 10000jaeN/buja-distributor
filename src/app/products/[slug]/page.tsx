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
        className="mx-auto w-full max-w-200"
        width={240}
        height={500}
      />
      <div className="mx-auto mt-5 max-w-200 px-4">
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
          <p className="text-brand-blue text-xl font-semibold">
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
        className="sticky top-17.25 flex justify-between border-b-1 border-gray-300 bg-white px-4 py-2"
      >
        <button>상세정보</button>
        <button>Q&A</button>
        <button>상품 리뷰</button>
        <button>배송정보</button>
      </div>

      <div className="mx-auto max-w-200">
        {product?.contentBlock.map((content) => {
          if (content.type === "image") {
            return (
              <Image
                src={content.value}
                alt="상세페이지"
                width={400}
                height={500}
                className="w-full"
              />
            );
          } else if (content.type === "text") {
            return (
              <div
                key={content.value}
                className="my-5 flex items-center justify-center"
              >
                {content.value}
              </div>
            );
          } else {
            return null;
          }
        })}
      </div>

      <nav className="fixed bottom-0 flex h-17.25 w-full items-center justify-between border-t border-gray-300 bg-white p-1">
        <div aria-label="상품 정보" className="flex items-center gap-1">
          <Image
            src={product?.thumbnail[0] || noImage}
            alt="상품 썸네일"
            width={60}
            height={60}
            className="h-15 w-15"
          />
          <div className="W-full flex min-w-0 flex-col pr-2">
            <p className="truncate">{product?.name}</p>
            <div className="flex justify-between">
              <p>{product?.price}</p>
              <div className="flex items-center gap-1">
                <button className="flex h-3 w-3 items-center justify-center rounded-[4px] border p-1">
                  -
                </button>
                <p>count</p>
                <button className="flex h-3 w-3 items-center justify-center rounded-[4px] border p-1">
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <button className="rounded-2xl border border-gray-300 bg-white px-3 py-2 text-[12px]">
            장바구니
          </button>
          <button className="bg-brand-blue rounded-2xl px-3 py-2 text-[12px] text-white">
            구매하기
          </button>
        </div>
      </nav>
    </main>
  );
};

export default productsDetailPage;
