import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  userId: string;
  nickName: string;
  email?: string;
  roles?: string;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  login: (userData: User) => void;
  logout: () => void;
  setUser: (userData: User | null) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,

      login: (userData) => set({ user: userData, isLoggedIn: true }),

      logout: () => {
        localStorage.removeItem("accessToken");
        set({ user: null, isLoggedIn: false });
      },

      setUser: (userData) => set({ user: userData, isLoggedIn: !!userData }),
    }),
    {
      name: "auth-storage",
    },
  ),
);

export default useAuthStore;
