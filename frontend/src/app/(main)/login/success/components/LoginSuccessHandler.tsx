"use client";

import axiosInstance from "@/lib/axios";
import useAuthStore from "@/store/useAuthStore";
import useCartStore from "@/store/useCartStore";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

interface ExchangeResponse {
  accessToken: string;
  userId: string;
  nickName: string;
  roles: string;
}

const LoginSuccessHandler = () => {
  const searchParams = useSearchParams();
  const ticket = searchParams.get("ticket");
  const router = useRouter();
  const { login, isLoggedIn } = useAuthStore();
  const hasCalled = useRef(false);

  useEffect(() => {
    if (!ticket || hasCalled.current || isLoggedIn) return;

    const exchange = async () => {
      try {
        const res = await axiosInstance.post<ExchangeResponse>(
          "/auth/exchange",
          { ticket },
        );
        const { accessToken, userId, nickName, roles } = res.data;

        if (res.data.accessToken) {
          const isAutoLogin = localStorage.getItem("autoLogin") !== "false";
          if (isAutoLogin) {
            localStorage.setItem("accessToken", accessToken);
          } else {
            sessionStorage.setItem("accessToken", accessToken);
          }
          axiosInstance.defaults.headers.common["Authorization"] =
            `Bearer ${accessToken}`;
        }

        login({ userId, nickName, roles });

        axiosInstance.get("/carts").then((res) => {
          useCartStore.getState().setCount(res.data.data.items.length);
        }).catch(() => {});

        toast.success(`${nickName}님, 환영합니다!`);
        router.replace("/");
      } catch (err) {
        console.error("인증 실패: ", err);
        toast.error("로그인에 실패했습니다. 다시 시도해주세요.");
        router.replace("/login");
      }
    };

    exchange();
  }, [ticket, router, isLoggedIn]);

  return null;
};

export default LoginSuccessHandler;
