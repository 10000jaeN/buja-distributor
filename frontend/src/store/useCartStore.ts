import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartState {
  count: number;
  setCount: (n: number) => void;
  increment: (n?: number) => void;
  reset: () => void;
}

const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      count: 0,
      setCount: (n) => set({ count: n }),
      increment: (n = 1) => set((state) => ({ count: state.count + n })),
      reset: () => set({ count: 0 }),
    }),
    { name: "cart-count" },
  ),
);

export default useCartStore;
