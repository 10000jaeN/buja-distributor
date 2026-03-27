import { create } from "zustand";
import { persist } from "zustand/middleware";
import useCartStore from "./useCartStore";

interface User {
  userId: string;
  nickName: string;
  email?: string;
  roles?: string;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isInitialized: boolean;
  login: (userData: User) => void;
  logout: () => void;
  setUser: (userData: User | null) => void;
  setInitialized: (v: boolean) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      isInitialized: false,

      login: (userData) => set({ user: userData, isLoggedIn: true }),

      logout: () => {
        localStorage.removeItem("accessToken");
        useCartStore.getState().reset();
        set({ user: null, isLoggedIn: false });
      },

      setUser: (userData) => set({ user: userData, isLoggedIn: !!userData }),

      setInitialized: (v) => set({ isInitialized: v }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
    },
  ),
);

export default useAuthStore;
