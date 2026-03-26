"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // 💡 실제 운영 환경에서는 Sentry 같은 로그 수집 도구로 에러를 보냅니다.
    console.error("Critical Error Catch:", error);
  }, [error]);

  console.log(process.env.NODE_ENV);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <h1 className="mb-4 text-2xl font-bold text-gray-800">
        일시적인 오류가 발생했습니다.
      </h1>
      <p className="mb-8 text-gray-600">
        요청하신 페이지를 불러오는 중 문제가 생겼습니다.
        <br />
        잠시 후 다시 시도해 주세요.
      </p>

      <div className="flex gap-4">
        {/* 1. 재시도: 페이지의 현재 상태를 다시 불러오려 시도함 */}
        <button
          onClick={() => reset()}
          className="bg-brand-blue hover:bg-brand-blue-dark rounded-lg px-6 py-2 text-white"
        >
          다시 시도
        </button>

        {/* 2. 홈으로 이동: 유저가 미로에 갇히지 않게 탈출구를 제공 */}
        <Link
          href="/"
          className="rounded-lg border border-gray-300 px-6 py-2 text-gray-600 hover:bg-gray-100"
        >
          메인화면으로
        </Link>
      </div>

      {/* 개발 환경에서만 보여주는 디테일 (디버깅용) */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-10 w-full max-w-2xl text-left">
          <p className="mb-2 text-sm font-semibold text-red-400">Debug Info:</p>
          <pre className="overflow-auto rounded bg-gray-100 p-4 text-xs text-red-500">
            {error.name}: {error.message}
          </pre>
        </div>
      )}
    </div>
  );
}
