import { productService } from "@/api/productService";
import FreeShippingClient from "./_components/FreeShippingClient";

type SortValue = "recent" | "populate" | "price_asc" | "price_desc";
const VALID_SORTS: SortValue[] = ["recent", "populate", "price_asc", "price_desc"];

function toSortValue(raw: string | undefined): SortValue {
  return VALID_SORTS.includes(raw as SortValue) ? (raw as SortValue) : "recent";
}

export default async function FreeShippingPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort: rawSort } = await searchParams;
  const sort = toSortValue(rawSort);

  const products = await productService.getProducts({ sort, freeShipping: true });

  return <FreeShippingClient initialProducts={products} sort={sort} />;
}
