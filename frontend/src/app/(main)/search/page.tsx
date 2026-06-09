import { productService } from "@/api/productService";
import SearchClient from "./_components/SearchClient";

type SortValue = "recent" | "populate" | "price_asc" | "price_desc";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const { q = "", sort = "recent" } = await searchParams;

  const products = q
    ? await productService.getProducts({ q, sort: sort as SortValue })
    : [];

  return (
    <SearchClient
      initialProducts={products}
      q={q}
      sort={sort as SortValue}
    />
  );
}
