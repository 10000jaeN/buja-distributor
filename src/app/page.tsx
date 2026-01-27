import Carousel from "@/components/ui/Carousel";
import ProductList from "@/components/ui/ProductList";
import { productService } from "@/api/productService";

export default async function Home() {
  const BestProducts = await productService.getProducts({
    sort: "populate",
    limit: 4,
  });

  return (
    <main className="mt-0">
      <Carousel />

      <div className="mx-3 max-w-256 lg:mx-auto">
        <p className="mb-3 text-[20px] font-bold">🎁 지금 가장 인기있는 상품</p>
        <ul
          aria-label="지금 가장 인기있는 상품 목록"
          className="mx-auto grid grid-cols-2 justify-between md:grid-cols-3 lg:grid-cols-4"
        >
          <ProductList products={BestProducts} />
        </ul>
      </div>
    </main>
  );
}
