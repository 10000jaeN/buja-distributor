"use client";

import axiosInstance from "@/lib/axios";
import useAuthStore from "@/store/useAuthStore";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

interface ExchangeResponse {
  accessToken: string;
  userId: string;
  nickName: string;
}

const LoginSuccess = () => {
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
        const { accessToken, userId, nickName } = res.data;

        if (res.data.accessToken) {
          localStorage.setItem("accessToken", accessToken);
          axiosInstance.defaults.headers.common["Authorization"] =
            `Bearer ${accessToken}`;
        }

        login({ userId, nickName });

        router.replace("/");
      } catch (err) {
        console.error("인증 실패: ", err);
        alert("로그인에 실패했습니다. 다시 시도해주세요.");
        router.replace("/login");
      }
    };

    exchange();
  }, [ticket, router, isLoggedIn]);

  return (
    <div className="mt-20 flex justify-center text-[20px] font-bold">
      로그인 하는 중...
    </div>
  );
};

export default LoginSuccess;
