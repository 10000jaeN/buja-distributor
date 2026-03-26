"use client";

import { GoogleIcon, KakaoIcon, Logo, NIcon } from "@/assets";
import useAuthStore from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Login = () => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const router = useRouter();
  const handleClickSocialLogin = (social: "google" | "kakao" | "naver") => {
    window.location.replace(
      `${process.env.NEXT_PUBLIC_API_TEST_URL}/auth/${social}`,
    );
  };

  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/");
    }
  }, [isLoggedIn, router]);

  return (
    <div className="flex min-h-[calc(100vh-69px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm md:max-w-md">
        {/* 카드 */}
        <div className="rounded-2xl bg-white px-8 py-10 shadow-lg md:px-10 md:py-12">
          {/* 로고 + 헤더 */}
          <div className="mb-8 flex flex-col items-center gap-4">
            <Logo className="w-28" shapeRendering="crispEdges" />
            <div className="flex flex-col items-center gap-1">
              <h1 className="text-foreground text-3xl font-bold">Login</h1>
              <p className="text-sm text-gray-500">간편하게 로그인하세요</p>
            </div>
          </div>

          {/* 소셜 로그인 버튼 */}
          <div className="flex flex-col gap-3">
            {/* Google */}
            <button
              onClick={() => handleClickSocialLogin("google")}
              className="flex items-center rounded-xl border border-[#747775] px-4 py-3.5 font-medium transition-colors duration-200 hover:bg-gray-50"
            >
              <span className="flex w-6 shrink-0 items-center justify-center">
                <GoogleIcon className="h-5 w-5" />
              </span>
              <span className="flex flex-1 justify-center text-sm font-semibold text-gray-700">
                Google 계정으로 로그인
              </span>
            </button>

            {/* Kakao */}
            <button
              onClick={() => handleClickSocialLogin("kakao")}
              className="flex items-center rounded-xl bg-[#fee500] px-4 py-3.5 transition-opacity duration-200 hover:opacity-90"
            >
              <span className="flex w-6 shrink-0 items-center justify-center">
                <KakaoIcon />
              </span>
              <span className="flex flex-1 justify-center text-sm font-semibold text-[#191919]">
                카카오 로그인
              </span>
            </button>

            {/* Naver */}
            <button
              onClick={() => handleClickSocialLogin("naver")}
              className="flex items-center rounded-xl bg-[#03c75a] px-4 py-3.5 transition-opacity duration-200 hover:opacity-90"
            >
              <span className="flex w-6 shrink-0 items-center justify-center">
                <NIcon />
              </span>
              <span className="flex flex-1 justify-center text-sm font-semibold text-white">
                네이버 로그인
              </span>
            </button>
          </div>

          {/* 하단 안내 문구 */}
          <p className="mt-8 text-center text-xs leading-relaxed text-gray-400">
            로그인 시 이용약관 및 개인정보처리방침에 동의합니다
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
