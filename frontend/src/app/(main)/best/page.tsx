import { productService } from "@/api/productService";
import BestClient from "./_components/BestClient";

export default async function BestPage() {
  const products = await productService.getProducts({ sort: "best" });

  return <BestClient products={products} />;
}
