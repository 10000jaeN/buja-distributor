import { productService } from "@/api/productService";
import { categoryService } from "@/api/categoryService";
import ProductsClient from "./_components/ProductsClient";

type SortValue = "recent" | "populate" | "price_asc" | "price_desc";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sub?: string; sort?: string }>;
}) {
  const { category = "", sub = "", sort = "recent" } = await searchParams;

  const [products, children] = await Promise.all([
    productService.getProducts({
      category: category || undefined,
      sub: sub || undefined,
      sort: sort as SortValue,
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
      sort={sort as SortValue}
    />
  );
}
