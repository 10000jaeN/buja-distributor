import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import useCartStore from "./useCartStore";
import { apiClient } from "@/lib/apiClient";

// autoLogin 플래그에 따라 localStorage / sessionStorage를 동적으로 선택
const adaptiveStorage = createJSONStorage(() => ({
  getItem: (name: string) =>
    localStorage.getItem(name) ?? sessionStorage.getItem(name),
  setItem: (name: string, value: string) => {
    const isAutoLogin = localStorage.getItem("autoLogin") !== "false";
    if (isAutoLogin) {
      localStorage.setItem(name, value);
      sessionStorage.removeItem(name);
    } else {
      sessionStorage.setItem(name, value);
      localStorage.removeItem(name);
    }
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
    sessionStorage.removeItem(name);
  },
}));

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
        apiClient.post("/auth/logout").catch(() => {});
        localStorage.removeItem("accessToken");
        sessionStorage.removeItem("accessToken");
        useCartStore.getState().reset();
        set({ user: null, isLoggedIn: false });
      },

      setUser: (userData) => set({ user: userData, isLoggedIn: !!userData }),

      setInitialized: (v) => set({ isInitialized: v }),
    }),
    {
      name: "auth-storage",
      storage: adaptiveStorage,
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
    },
  ),
);

export default useAuthStore;
