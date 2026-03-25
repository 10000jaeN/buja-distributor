import Carousel from "@/components/ui/Carousel";
import ProductList from "@/components/ui/ProductList";
import { productService } from "@/api/productService";

export default async function Home() {
  const BestProducts = await productService.getProducts({
    sort: "populate",
    limit: 10,
  });

  const otherProducts = await productService.getProducts({
    sort: "price_desc",
    limit: 10,
  });

  const otherProducts2 = await productService.getProducts({
    sort: "recent",
    limit: 10,
  });

  return (
    <main className="mt-0">
      <Carousel />

      <div className="my-15 max-w-256 overflow-hidden md:mx-3 lg:mx-auto">
        <ProductList
          title="인기 상품"
          products={BestProducts}
        />
        <ProductList
          title="특별 할인"
          products={otherProducts}
        />
        <ProductList title="최신 상품" products={otherProducts2} />
      </div>
    </main>
  );
}
