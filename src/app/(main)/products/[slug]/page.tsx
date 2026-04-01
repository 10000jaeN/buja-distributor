import Image from "next/image";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import noImage from "@/public/images/no-image.png";
import { productService } from "@/api/productService";
import { StarIcon } from "@/assets";
import { ProductActions } from "./_components/ProductActions";
import { ProductTabs } from "./_components/ProductTabs";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await productService.getProductBySlug(slug).catch(() => null);

  if (!product) return { title: "상품을 찾을 수 없습니다" };

  return {
    title: product.name,
    description: `${product.name} — ${product.price.toLocaleString()}원`,
    openGraph: {
      title: product.name,
      description: `${product.name} — ${product.price.toLocaleString()}원`,
      images: product.thumbnail[0] ? [{ url: product.thumbnail[0] }] : [],
      type: "website",
    },
  };
}

const productsDetailPage = async ({ params }: Props) => {
  const { slug } = await params;

  const product = await productService.getProductBySlug(slug);

  if (!slug || slug === "undefined") {
    redirect("/error404");
  }

  return (
    <main className="pb-24 md:pb-0">
      {/* 태블릿+PC: 2열 레이아웃 / 모바일: 1열 */}
      <div className="mx-auto max-w-[1024px] md:grid md:grid-cols-[320px_1fr] md:items-stretch md:gap-8 md:px-5 md:py-8 lg:grid-cols-[460px_1fr] lg:gap-12 lg:py-10">
        {/* 썸네일 이미지 */}
        <div className="w-full overflow-hidden bg-gray-50 md:shrink-0 md:rounded-2xl lg:w-[460px]">
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
        <div className="px-4 pt-5 pb-4 md:flex md:flex-col md:justify-between md:px-0 md:pt-0 md:pb-0">
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
          <h1 className="mt-3 text-xl leading-snug font-bold text-gray-900 md:text-xl lg:text-2xl">
            {product?.name}
          </h1>

          {/* 구분선 */}
          <hr className="mt-5 border-gray-200" />

          {/* 가격 정보 */}
          <dl className="mt-5 flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-500">판매가</dt>
              <dd className="text-brand-blue text-2xl font-bold md:text-2xl lg:text-3xl">
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

      <ProductTabs
        contentBlock={product?.contentBlock ?? []}
        shippingFee={product?.shippingFee ?? 3000}
        freeShippingThreshold={product?.freeShippingThreshold ?? 0}
      />

    </main>
  );
};

export default productsDetailPage;
