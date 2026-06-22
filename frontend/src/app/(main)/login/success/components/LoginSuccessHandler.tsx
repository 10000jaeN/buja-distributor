"use client";

import { apiClient } from "@/lib/apiClient";
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
        const { accessToken, userId, nickName, roles } =
          await apiClient.post<ExchangeResponse>("/auth/exchange", { ticket });

        const isAutoLogin = localStorage.getItem("autoLogin") !== "false";
        if (isAutoLogin) {
          localStorage.setItem("accessToken", accessToken);
        } else {
          sessionStorage.setItem("accessToken", accessToken);
        }

        login({ userId, nickName, roles });

        apiClient.get<{ data: { items: unknown[] } }>("/carts").then((res) => {
          useCartStore.getState().setCount(res.data.items.length);
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
  }, [ticket, router, isLoggedIn, login]);

  return null;
};

export default LoginSuccessHandler;
