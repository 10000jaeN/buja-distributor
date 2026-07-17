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
    if (p.target === "all") return true;
    if (p.target === "product") return p.targetIds.includes(product._id);
    if (p.target === "category") return p.targetIds.includes(product.category.parent);
    return false;
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
