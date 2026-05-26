import axiosInstance from "@/lib/axios";
import { Product } from "@/types/product";

export type CartItem = {
  productId: Product;
  quantity: number;
};

export type Cart = {
  _id: string;
  user: string;
  items: CartItem[];
  totalAmount: number;
};

export const cartService = {
  getCart: async (): Promise<Cart> => {
    const res = await axiosInstance.get<{ data: Cart }>("/carts");
    return res.data.data;
  },

  addToCart: async (productId: string, quantity: number = 1): Promise<Cart> => {
    const res = await axiosInstance.post<{ data: Cart }>("/carts/item", {
      productId,
      quantity,
    });
    return res.data.data;
  },

  updateCartItem: async (productId: string, quantity: number): Promise<Cart> => {
    const res = await axiosInstance.patch<{ data: Cart }>(`/carts/${productId}`, {
      quantity,
    });
    return res.data.data;
  },

  removeCartItems: async (productIds: string[]): Promise<Cart> => {
    const res = await axiosInstance.post<{ data: Cart }>("/carts/item/remove-items", {
      productIds,
    });
    return res.data.data;
  },
};
