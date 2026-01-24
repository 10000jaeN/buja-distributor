"use client";

import { GoogleIcon, KakaoIcon, NIcon } from "@/assets";
import useAuthStore from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Login = () => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const router = useRouter();
  const handleClickSocialLogin = (social: "google" | "kakao" | "naver") => {
    window.location.replace(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/${social}`,
    );
  };

  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/");
    }
  }, [isLoggedIn, router]);

  return (
    <div className="mx-auto flex w-[80vw] max-w-100 flex-col">
      <div className="my-20 flex justify-center text-5xl">Login</div>
      <div className="flex flex-col gap-4">
        <button
          onClick={() => handleClickSocialLogin("google")}
          className="flex items-center justify-center rounded-sm border border-[#747775] px-3 py-[10px] font-medium"
        >
          <GoogleIcon className="h-5 w-5" />
          <div className="flex flex-1 justify-center text-[16px]">
            Google 계정으로 로그인
          </div>
        </button>

        <button
          onClick={() => handleClickSocialLogin("kakao")}
          className="flex items-center justify-center rounded-[12px] bg-[#fee500] p-4 text-[16px] font-medium"
        >
          <KakaoIcon />
          <div className="flex flex-1 justify-center">카카오 로그인</div>
        </button>
        <button
          onClick={() => handleClickSocialLogin("naver")}
          className="flex w-full items-center justify-center rounded-xl bg-[#03a94d] px-5 py-4 text-white"
        >
          <NIcon />
          <div className="flex flex-1 justify-center text-[16px] font-semibold">
            네이버 로그인
          </div>
        </button>
      </div>
    </div>
  );
};

export default Login;
