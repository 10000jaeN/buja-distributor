import axiosInstance from "@/lib/axios";
import { Product } from "@/types/product";

export const productService = {
  /**
   * 상품 전체 목록 가져오기
   * @queryString sort, limit, category
   */
  getProducts: async ({
    sort,
    limit,
    category,
  }: {
    sort?: "recent" | "populate" | "price_asc" | "price_desc";
    limit?: number;
    category?: string;
  }): Promise<Product[]> => {
    const res = await axiosInstance.get<{ data: Product[] }>("/products", {
      params: { sort, limit, category },
    });

    return res.data.data;
  },

  /**
   * 상품 상세 정보 가져오기 (Slug 기반)
   * @param slug - URL에서 추출한 인코딩된 슬러그
   */
  getProductBySlug: async (slug: string): Promise<Product | null> => {
    const decodedSlug = decodeURIComponent(slug);

    const res = await axiosInstance.get<{ data: Product }>(
      `/products/${decodedSlug}`,
    );
    console.log(res.data);
    return res.data.data;
  },

  /**
   * 카테고리별 상품 목록 가져오기
   * @param category - 필터링할 카테고리 명칭
   */
  getProductsByCategory: async (category: string): Promise<Product[]> => {
    const decodedCategory = decodeURIComponent(category);

    const res = await axiosInstance.get<Product[]>(`/products`, {
      params: { category: decodedCategory },
    });

    return res.data;
  },

  /**
   * 특정 슬러그를 가진 상품 삭제하기
   * @access Admin Only
   * @param slug
   */
  deleteProductBySlug: async (slug: string): Promise<void> => {
    const decodedSlug = decodeURIComponent(slug);

    const res = await axiosInstance.delete(`/products/${decodedSlug}`);
  },
};
