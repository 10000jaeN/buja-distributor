import { create } from "zustand";

export interface CheckoutItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  shippingFee: number;
  bundleShipping: boolean;
  thumbnail: string;
}

interface CheckoutStore {
  items: CheckoutItem[];
  shippingFee: number;
  totalAmount: number;
  setCheckout: (
    items: CheckoutItem[],
    shippingFee: number,
    totalAmount: number
  ) => void;
  clear: () => void;
}

const useCheckoutStore = create<CheckoutStore>((set) => ({
  items: [],
  shippingFee: 0,
  totalAmount: 0,
  setCheckout: (items, shippingFee, totalAmount) =>
    set({ items, shippingFee, totalAmount }),
  clear: () => set({ items: [], shippingFee: 0, totalAmount: 0 }),
}));

export default useCheckoutStore;
