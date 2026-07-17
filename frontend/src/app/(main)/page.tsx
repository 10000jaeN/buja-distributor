import Carousel from "@/components/shared/Carousel";
import ProductList from "@/components/shared/ProductList";
import EventPopup from "@/components/shared/EventPopup";
import { productService } from "@/api/productService";
import { promotionService } from "@/api/promotionService";

export default async function Home() {
  const [BestProducts, otherProducts, otherProducts2] = await Promise.all([
    productService.getProducts({ sort: "populate", limit: 10 }).catch(() => []),
    productService.getProducts({ sort: "price_desc", limit: 10 }).catch(() => []),
    productService.getProducts({ sort: "recent", limit: 10 }).catch(() => []),
  ]);

  const allProducts = [...BestProducts, ...otherProducts, ...otherProducts2];
  const promotions = await promotionService
    .getActive(
      [...new Set(allProducts.map((p) => p._id))],
      [...new Set(allProducts.map((p) => p.category.parent))]
    )
    .catch(() => []);

  return (
    <main className="mt-0">
      <EventPopup />
      <Carousel />

      <div className="my-15 max-w-256 overflow-hidden md:mx-3 lg:mx-auto">
        <ProductList title="인기 상품" products={BestProducts} promotions={promotions} />
        <ProductList title="특별 할인" products={otherProducts} promotions={promotions} />
        <ProductList title="최신 상품" products={otherProducts2} promotions={promotions} />
      </div>
    </main>
  );
}
