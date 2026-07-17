import { Product } from "@/types/product";
import { Promotion } from "@/api/promotionService";

export type ProductDiscount = {
  discountedPrice: number;
  discountAmount: number;
  label: string;        // "10%" 또는 "3,000원"
  promotionName: string;
};

export function calcProductDiscount(
  product: Product,
  promotions: Promotion[]
): ProductDiscount | null {
  const applicable = promotions.filter((p) => {
    // 대상 조건
    const targetMatch =
      p.target === "all" ||
      (p.target === "product" && p.targetIds.includes(product._id)) ||
      (p.target === "category" && p.targetIds.includes(product.category.parent));
    if (!targetMatch) return false;

    // 최소 주문금액 조건 — 단일 상품 1개 기준으로 판단
    if (p.minOrderAmount !== null && product.price < p.minOrderAmount) return false;

    // 최소 수량 조건 — 1개 구매 기준으로 판단
    if (p.minQuantity !== null && p.minQuantity > 1) return false;

    return true;
  });

  if (applicable.length === 0) return null;

  let best: Promotion | null = null;
  let bestAmount = 0;

  for (const promo of applicable) {
    const amount =
      promo.type === "percentage"
        ? Math.floor(product.price * (promo.value / 100))
        : promo.value;
    if (amount > bestAmount) {
      bestAmount = amount;
      best = promo;
    }
  }

  if (!best || bestAmount === 0) return null;

  return {
    discountedPrice: Math.max(0, product.price - bestAmount),
    discountAmount: bestAmount,
    label: best.type === "percentage" ? `${best.value}%` : `${best.value.toLocaleString()}원`,
    promotionName: best.name,
  };
}
