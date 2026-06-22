import { productService } from "@/api/productService";
import SearchClient from "./_components/SearchClient";

type SortValue = "recent" | "populate" | "price_asc" | "price_desc";
const VALID_SORTS: SortValue[] = ["recent", "populate", "price_asc", "price_desc"];

function toSortValue(raw: string | undefined): SortValue {
  return VALID_SORTS.includes(raw as SortValue) ? (raw as SortValue) : "recent";
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const { q = "", sort: rawSort } = await searchParams;
  const sort = toSortValue(rawSort);

  const products = q
    ? await productService.getProducts({ q, sort })
    : [];

  return (
    <SearchClient
      initialProducts={products}
      q={q}
      sort={sort}
    />
  );
}
