"use client";

import axiosInstance from "@/lib/axios";
import useAuthStore from "@/store/useAuthStore";
import useCartStore from "@/store/useCartStore";
import { useEffect, useRef } from "react";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout, setUser, setInitialized } = useAuthStore();
  const hasCalled = useRef(false);

  useEffect(() => {
    if (hasCalled.current) return;
    hasCalled.current = true;

    const initAuth = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        logout();
        setInitialized(true);
        return;
      }

      try {
        const { data } = await axiosInstance.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(data.user);

        axiosInstance.get("/carts").then((res) => {
          useCartStore.getState().setCount(res.data.data.items.length);
        }).catch(() => {});
      } catch (err) {
        console.error("세션 만료:", err);
        localStorage.removeItem("accessToken");
        logout();
      } finally {
        setInitialized(true);
      }
    };

    initAuth();
  }, []);

  return <>{children}</>;
}
