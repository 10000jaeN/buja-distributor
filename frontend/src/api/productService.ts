import { apiClient } from "@/lib/apiClient";
import { Category, Product } from "@/types/product";

export const productService = {
  getProducts: async ({
    sort,
    limit,
    category,
    sub,
    q,
    freeShipping,
  }: {
    sort?: "recent" | "populate" | "price_asc" | "price_desc" | "best";
    limit?: number;
    category?: string;
    sub?: string;
    q?: string;
    freeShipping?: boolean;
  }): Promise<Product[]> => {
    const res = await apiClient.get<{ data: Product[] }>("/products", {
      params: { sort, limit, category, sub, q, freeShipping },
    });
    return res.data;
  },

  getProductBySlug: async (slug: string): Promise<Product | null> => {
    const decodedSlug = decodeURIComponent(slug);
    const res = await apiClient.get<{ data: Product }>(`/products/${decodedSlug}`);
    return res.data;
  },

  getProductsByCategory: async (category: string): Promise<Product[]> => {
    const decodedCategory = decodeURIComponent(category);
    const res = await apiClient.get<{ data: Product[] }>("/products", {
      params: { category: decodedCategory },
    });
    return res.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const res = await apiClient.get<{ data: Category[] }>("/products/categories");
    return res.data;
  },

  deleteProductBySlug: async (slug: string): Promise<void> => {
    const decodedSlug = decodeURIComponent(slug);
    await apiClient.delete(`/products/${decodedSlug}`);
  },

  createProduct: async (data: {
    name: string;
    price: number;
    shippingFee: number;
    freeShippingThreshold: number;
    bundleShipping: boolean;
    category: { parent: string; child: string };
    thumbnail: string[];
    stock?: number | null;
    isAvailable?: boolean;
    content?: string;
    contentBlock?: { type: "text" | "image"; value: string }[];
  }): Promise<Product> => {
    const res = await apiClient.post<{ data: Product }>("/products", data);
    return res.data;
  },

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
      stock: number | null;
      isAvailable: boolean;
      content: string;
      contentBlock: { type: "text" | "image"; value: string }[];
    }>,
  ): Promise<Product> => {
    const decodedSlug = decodeURIComponent(slug);
    const res = await apiClient.patch<{ data: Product }>(
      `/products/${decodedSlug}`,
      data,
    );
    return res.data;
  },
};
