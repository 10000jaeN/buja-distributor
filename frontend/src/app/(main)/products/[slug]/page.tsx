import Image from "next/image";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import noImage from "@/public/images/no-image.png";
import { productService } from "@/api/productService";
import { ProductActions } from "./_components/ProductActions";
import { ProductInfoSection } from "./_components/ProductInfoSection";
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

  // slug 유효성 검사를 API 호출 전에 수행
  if (!slug || slug === "undefined") {
    redirect("/error404");
  }

  const product = await productService.getProductBySlug(slug).catch(() => null);

  if (!product) {
    redirect("/error404");
  }

  const infoProps = {
    name: product?.name ?? "",
    price: product?.price ?? 0,
    shippingFee: product?.shippingFee ?? 3000,
    freeShippingThreshold: product?.freeShippingThreshold ?? 0,
    ratingAverage: product?.stats.ratingAverage ?? 0,
    reviewCount: product?.stats.reviewCount ?? 0,
  };

  const actionsProps = {
    productId: product?._id ?? "",
    price: product?.price ?? 0,
    shippingFee: product?.shippingFee ?? 3000,
    freeShippingThreshold: product?.freeShippingThreshold ?? 0,
    thumbnail: product?.thumbnail[0] || noImage.src,
    name: product?.name ?? "",
  };

  return (
    <main className="pb-24 lg:pb-0">
      <div className="mx-auto max-w-[1100px] lg:flex lg:items-start lg:gap-10 lg:px-6 lg:py-10">
        {/* 왼쪽: 썸네일 + 탭 */}
        <div className="lg:min-w-0 lg:flex-1">
          {/* 썸네일 */}
          <div className="overflow-hidden bg-gray-50 lg:rounded-2xl">
            <Image
              src={product?.thumbnail[0] || noImage}
              alt={product?.name ?? "상품 이미지"}
              className="mx-auto w-full object-cover"
              width={800}
              height={800}
              priority
            />
          </div>

          {/* 모바일 상품 정보 (lg 미만에서만 표시) */}
          <ProductInfoSection {...infoProps} className="px-4 pt-5 pb-4 lg:hidden" />

          {/* 탭 */}
          <ProductTabs
            productId={product._id}
            productName={product.name}
            content={product?.content}
            contentBlock={product?.contentBlock ?? []}
            shippingFee={product?.shippingFee ?? 3000}
            freeShippingThreshold={product?.freeShippingThreshold ?? 0}
          />
        </div>

        {/* 오른쪽: 플로팅 상품 정보 사이드바 (lg 이상에서만 표시) */}
        <aside className="lg:sticky lg:top-[calc(var(--nav-height)+2.5rem)] lg:block lg:w-[360px] lg:shrink-0">
          <ProductInfoSection {...infoProps} className={"hidden lg:block"} />
          <ProductActions {...actionsProps} />
        </aside>
      </div>
    </main>
  );
};

export default productsDetailPage;
