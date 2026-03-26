import Image from "next/image";
import { redirect } from "next/navigation";

import noImage from "@/public/images/no-image.png";
import { productService } from "@/api/productService";
import { StarIcon } from "@/assets";
import { ProductActions } from "./ProductActions";

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
    <main className="pb-24 lg:pb-0">
      {/* PC: 2열 레이아웃 / 모바일: 1열 */}
      <div className="mx-auto max-w-[1024px] lg:grid lg:grid-cols-[460px_1fr] lg:items-stretch lg:gap-12 lg:py-10">
        {/* 썸네일 이미지 */}
        <div className="w-full overflow-hidden bg-gray-50 lg:w-[460px] lg:shrink-0 lg:rounded-2xl">
          <Image
            src={product?.thumbnail[0] || noImage}
            alt="thumbnail"
            className="mx-auto w-full object-cover"
            width={800}
            height={800}
            priority
          />
        </div>

        {/* 상품 정보 섹션 */}
        <div className="px-4 pt-5 pb-4 lg:flex lg:flex-col lg:justify-between lg:pt-0 lg:pb-0">
          {/* 별점 */}
          <div aria-label="별점" className="flex items-center gap-1.5">
            <StarIcon className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-500">
              {product?.stats.ratingAverage}
            </span>
            <span className="text-sm text-gray-400">
              ｜ 후기 {product?.stats.reviewCount}개
            </span>
          </div>

          {/* 상품명 */}
          <h1 className="mt-3 text-xl leading-snug font-bold text-gray-900 lg:text-2xl">
            {product?.name}
          </h1>

          {/* 구분선 */}
          <hr className="mt-5 border-gray-200" />

          {/* 가격 정보 */}
          <dl className="mt-5 flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-500">판매가</dt>
              <dd className="text-brand-blue text-2xl font-bold lg:text-3xl">
                {product?.price.toLocaleString()}원
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-500">배송비</dt>
              <dd className="text-sm font-medium text-gray-700">
                {product?.shippingFee === 0 ? (
                  <span className="text-brand-blue">무료</span>
                ) : (
                  <>
                    {(product?.shippingFee ?? 3000).toLocaleString()}원
                    {(product?.freeShippingThreshold ?? 0) > 0 && (
                      <span className="ml-1.5 text-xs text-gray-400">
                        ({(product?.freeShippingThreshold ?? 0).toLocaleString()}원 이상 무료)
                      </span>
                    )}
                  </>
                )}
              </dd>
            </div>
          </dl>

          <hr className="mt-5 border-gray-100" />

          <ProductActions
            productId={product?._id ?? ""}
            price={product?.price ?? 0}
            shippingFee={product?.shippingFee ?? 3000}
            freeShippingThreshold={product?.freeShippingThreshold ?? 0}
            thumbnail={product?.thumbnail[0] || noImage.src}
            name={product?.name ?? ""}
          />
        </div>
      </div>

      {/* 탭 툴바 */}
      <div
        aria-label="ToolBar"
        className="sticky top-17.25 z-40 flex justify-around border-b border-gray-200 bg-white"
      >
        <button className="border-brand-blue text-brand-blue flex-1 border-b-2 py-3 text-sm font-semibold">
          상세정보
        </button>
        <button className="flex-1 border-b-2 border-transparent py-3 text-sm text-gray-500 hover:text-gray-700">
          Q&A
        </button>
        <button className="flex-1 border-b-2 border-transparent py-3 text-sm text-gray-500 hover:text-gray-700">
          상품 리뷰
        </button>
        <button className="flex-1 border-b-2 border-transparent py-3 text-sm text-gray-500 hover:text-gray-700">
          배송정보
        </button>
      </div>

      {/* 상세 콘텐츠 블록 */}
      <div className="mx-auto max-w-200">
        {product?.contentBlock.map((content, index) => {
          if (content.type === "image") {
            return (
              <Image
                key={index}
                src={content.value}
                alt="상세페이지"
                width={800}
                height={800}
                className="w-full"
              />
            );
          } else if (content.type === "text") {
            return (
              <div
                key={content.value}
                className="px-4 py-5 text-sm leading-relaxed text-gray-700"
              >
                {content.value}
              </div>
            );
          } else {
            return null;
          }
        })}
      </div>

    </main>
  );
};

export default productsDetailPage;
