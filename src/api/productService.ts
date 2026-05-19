import axiosInstance from "@/lib/axios";
import { Category, Product } from "@/types/product";

export const productService = {
  /**
   * 상품 전체 목록 가져오기
   * @queryString sort, limit, category
   */
  getProducts: async ({
    sort,
    limit,
    category,
    sub,
    q,
  }: {
    sort?: "recent" | "populate" | "price_asc" | "price_desc";
    limit?: number;
    category?: string;
    sub?: string;
    q?: string;
  }): Promise<Product[]> => {
    const res = await axiosInstance.get<{ data: Product[] }>("/products", {
      params: { sort, limit, category, sub, q },
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
   * 카테고리 목록 가져오기
   */
  getCategories: async (): Promise<Category[]> => {
    const res = await axiosInstance.get<{ data: Category[] }>(
      "/products/categories",
    );
    return res.data.data;
  },

  /**
   * 특정 슬러그를 가진 상품 삭제하기
   * @access Admin Only
   * @param slug
   */
  deleteProductBySlug: async (slug: string): Promise<void> => {
    const decodedSlug = decodeURIComponent(slug);

    await axiosInstance.delete(`/products/${decodedSlug}`);
  },

  /**
   * 상품 생성
   * @access Admin Only
   */
  createProduct: async (data: {
    name: string;
    price: number;
    shippingFee: number;
    freeShippingThreshold: number;
    bundleShipping: boolean;
    category: { parent: string; child: string };
    thumbnail: string[];
    isAvailable?: boolean;
    contentBlock: { type: "text" | "image"; value: string }[];
  }): Promise<Product> => {
    const res = await axiosInstance.post<{ data: Product }>("/products", data);
    return res.data.data;
  },

  /**
   * 상품 수정
   * @access Admin Only
   * @param slug
   */
  updateProduct: async (
    slug: string,
    data: Partial<{
      name: string;
      price: number;
      shippingFee: number;
      freeShippingThreshold: number;
      bundleShipping: boolean;
      category: { parent: string; child: string };
      thumbnail: string[];
      isAvailable: boolean;
      contentBlock: { type: "text" | "image"; value: string }[];
    }>,
  ): Promise<Product> => {
    const res = await axiosInstance.patch<{ data: Product }>(
      `/products/${encodeURIComponent(slug)}`,
      data,
    );
    return res.data.data;
  },
};
