import { productService } from "@/api/productService";
import { categoryService } from "@/api/categoryService";
import { promotionService } from "@/api/promotionService";
import ProductsClient from "./_components/ProductsClient";

export const revalidate = 60;

type SortValue = "recent" | "populate" | "price_asc" | "price_desc";
const VALID_SORTS: SortValue[] = ["recent", "populate", "price_asc", "price_desc"];

function toSortValue(raw: string | undefined): SortValue {
  return VALID_SORTS.includes(raw as SortValue) ? (raw as SortValue) : "recent";
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sub?: string; sort?: string }>;
}) {
  const { category = "", sub = "", sort: rawSort } = await searchParams;
  const sort = toSortValue(rawSort);

  const [products, children] = await Promise.all([
    productService.getProducts({
      category: category || undefined,
      sub: sub || undefined,
      sort,
    }),
    category
      ? categoryService.getCategories().then(
          (cats) => cats.find((c) => c.parent === category)?.children ?? []
        )
      : Promise.resolve([] as string[]),
  ]);

  const promotions = await promotionService
    .getActive(
      products.map((p) => p._id),
      [...new Set(products.map((p) => p.category.parent))]
    )
    .catch(() => []);

  return (
    <ProductsClient
      initialProducts={products}
      initialChildren={children}
      initialPromotions={promotions}
      category={category}
      sub={sub}
      sort={sort}
    />
  );
}
