import { productService } from "@/api/productService";
import { categoryService } from "@/api/categoryService";
import ProductsClient from "./_components/ProductsClient";

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

  return (
    <ProductsClient
      initialProducts={products}
      initialChildren={children}
      category={category}
      sub={sub}
      sort={sort}
    />
  );
}
