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
                3,000원
                <span className="ml-1.5 text-xs text-gray-400">
                  (기본 배송)
                </span>
              </dd>
            </div>
          </dl>

          <hr className="mt-5 border-gray-100" />

          {/* PC 전용 수량 + 버튼 */}
          <div className="mt-6 hidden lg:block">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">수량</span>
              <div className="flex items-center gap-3">
                <button
                  aria-label="수량 감소"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-lg text-gray-600 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="min-w-[28px] text-center text-base font-medium text-gray-800">
                  1
                </span>
                <button
                  aria-label="수량 증가"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-lg text-gray-600 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button className="flex-1 rounded-xl border border-gray-300 bg-white py-4 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50">
                장바구니
              </button>
              <button className="bg-brand-blue flex-1 rounded-xl py-4 text-sm font-semibold text-white transition-colors hover:opacity-90">
                구매하기
              </button>
            </div>
          </div>
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

      {/* 하단 고정 구매 바 (모바일 전용) */}
      <nav
        aria-label="구매 바"
        className="fixed bottom-0 left-0 z-50 flex h-auto w-full items-center justify-between gap-2 border-t border-gray-200 bg-white px-3 py-2 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] lg:hidden"
      >
        <div
          aria-label="상품 정보"
          className="flex min-w-0 flex-1 items-center gap-2"
        >
          <Image
            src={product?.thumbnail[0] || noImage}
            alt="상품 썸네일"
            width={56}
            height={56}
            className="h-14 w-14 shrink-0 rounded-md object-cover"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="truncate text-sm font-medium text-gray-800">
              {product?.name}
            </p>
            <div className="flex items-center justify-between">
              <p className="text-brand-blue text-sm font-bold">
                {product?.price.toLocaleString()}원
              </p>
              <div className="flex items-center gap-2">
                <button
                  aria-label="수량 감소"
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-base text-gray-600 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="min-w-[20px] text-center text-sm font-medium text-gray-800">
                  1
                </span>
                <button
                  aria-label="수량 증가"
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-base text-gray-600 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-1.5">
          <button className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50">
            장바구니
          </button>
          <button className="bg-brand-blue rounded-xl px-4 py-2 text-xs font-semibold text-white transition-colors hover:opacity-90">
            구매하기
          </button>
        </div>
      </nav>
    </main>
  );
};

export default productsDetailPage;
