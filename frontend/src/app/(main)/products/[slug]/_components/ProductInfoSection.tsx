import { Star } from "lucide-react";
import { ProductDiscount } from "@/lib/promotionUtils";

type Props = React.ComponentProps<"div"> & {
  name: string;
  price: number;
  shippingFee: number;
  freeShippingThreshold: number;
  ratingAverage: number;
  reviewCount: number;
  stock: number | null;
  isAvailable: boolean;
  discount?: ProductDiscount | null;
};

export function ProductInfoSection({
  name,
  price,
  shippingFee,
  freeShippingThreshold,
  ratingAverage,
  reviewCount,
  stock,
  isAvailable,
  discount,
  ...divProps
}: Props) {
  return (
    <div {...divProps}>
      {/* 별점 */}
      <div aria-label="별점" className="flex items-center gap-1.5">
        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
        <span className="text-sm font-medium text-amber-500">
          {ratingAverage.toFixed(1)}
        </span>
        <span className="text-muted text-sm">｜ 후기 {reviewCount}개</span>
      </div>

      {/* 상품명 */}
      <h1 className="text-foreground mt-3 text-xl leading-snug font-bold lg:text-2xl">
        {name}
      </h1>

      <hr className="mt-5 border-gray-200" />

      {/* 가격 / 배송비 */}
      <dl className="mt-5 space-y-4">
        <div className="flex items-center justify-between">
          <dt className="text-subtle text-sm">판매가</dt>
          <dd className="text-right">
            {discount ? (
              <>
                <span className="block text-sm text-gray-400 line-through">
                  {price.toLocaleString()}원
                </span>
                <span className="text-brand-blue text-2xl font-bold lg:text-3xl">
                  {discount.discountedPrice.toLocaleString()}원
                </span>
                <span className="mt-1 block text-xs font-medium text-brand-blue">
                  {discount.promotionName} ({discount.label} 할인)
                </span>
              </>
            ) : (
              <span className="text-brand-blue text-2xl font-bold lg:text-3xl">
                {price.toLocaleString()}원
              </span>
            )}
          </dd>
        </div>
        {(!isAvailable || stock !== null) && (
          <div className="flex items-center justify-between">
            <dt className="text-subtle text-sm">재고</dt>
            <dd
              className={`text-sm font-medium ${
                !isAvailable || stock === 0
                  ? "text-red-500"
                  : stock !== null && stock <= 5
                    ? "text-red-500"
                    : "text-secondary-body"
              }`}
            >
              {!isAvailable || stock === 0
                ? "품절"
                : `${stock}개 남음`}
            </dd>
          </div>
        )}
        <div className="flex items-center justify-between">
          <dt className="text-subtle text-sm">배송비</dt>
          <dd className="text-secondary-body text-sm font-medium">
            {shippingFee === 0 ? (
              <span className="text-brand-blue">무료</span>
            ) : (
              <>
                {shippingFee.toLocaleString()}원
                {freeShippingThreshold > 0 && (
                  <span className="ml-1.5 text-xs text-gray-400">
                    ({freeShippingThreshold.toLocaleString()}원 이상 무료)
                  </span>
                )}
              </>
            )}
          </dd>
        </div>
      </dl>

      <hr className="mt-5 border-gray-100" />
    </div>
  );
}
