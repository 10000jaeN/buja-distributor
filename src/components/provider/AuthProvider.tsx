"use client";

import axiosInstance from "@/lib/axios";
import useAuthStore from "@/store/useAuthStore";
import { useEffect } from "react";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { login, logout, setUser, setInitialized } = useAuthStore();

  useEffect(() => {
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
      } catch (err) {
        console.error("세션 만료:", err);
        localStorage.removeItem("accessToken");
        logout();
      } finally {
        setInitialized(true);
      }
    };

    initAuth();
  }, [login, logout]);

  return <>{children}</>;
}
