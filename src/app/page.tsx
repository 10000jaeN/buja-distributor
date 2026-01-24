import axiosInstance from "@/lib/axios";

import Carousel from "@/components/ui/Carousel";
import ProductList from "@/components/ui/ProductList";
import { Product } from "@/types/product";

export default async function Home() {
  const getProducts = async (): Promise<Product[]> => {
    const { data } = await axiosInstance.get<Product[]>(
      "/products?sort=populate&limit=4",
    );
    return data;
  };

  const products = await getProducts();

  return (
    <main className="mt-0">
      <Carousel />

      <div className="mx-3">
        <p className="mb-3 text-[20px] font-bold">🎁 지금 가장 인기있는 상품</p>
        <ul
          aria-label="지금 가장 인기있는 상품 목록"
          className="mx-auto grid grid-cols-2 justify-between md:grid-cols-3"
        >
          <ProductList products={products} />
        </ul>
      </div>
    </main>
  );
}
