"use client";

import { apiClient } from "@/lib/apiClient";
import useAuthStore from "@/store/useAuthStore";
import useCartStore from "@/store/useCartStore";
import { useEffect, useRef } from "react";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout, clearSession, setUser, setInitialized } = useAuthStore();
  const hasCalled = useRef(false);

  useEffect(() => {
    if (hasCalled.current) return;
    hasCalled.current = true;

    const initAuth = async () => {
      const token = localStorage.getItem("accessToken") ?? sessionStorage.getItem("accessToken");

      if (!token) {
        clearSession();
        setInitialized(true);
        return;
      }

      try {
        const data = await apiClient.get<{ user: Parameters<typeof setUser>[0] }>("/auth/me");

        setUser(data.user);

        apiClient.get<{ data: { items: unknown[] } }>("/carts").then((res) => {
          useCartStore.getState().setCount(res.data.items.length);
        }).catch(() => {});
      } catch (err) {
        console.error("세션 만료:", err);
        clearSession();
      } finally {
        setInitialized(true);
      }
    };

    initAuth();
  }, []);

  return <>{children}</>;
}
