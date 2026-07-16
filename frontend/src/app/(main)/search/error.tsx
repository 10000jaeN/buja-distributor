"use client";

import Link from "next/link";

export default function SearchError({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto max-w-[var(--max-width)] px-5 py-10">
      <div className="flex min-h-60 flex-col items-center justify-center gap-3">
        <p className="text-gray-400">검색 결과를 불러오지 못했습니다.</p>
        <button
          onClick={reset}
          className="text-brand-blue text-sm hover:underline"
        >
          다시 시도
        </button>
        <Link href="/products" className="text-sm text-gray-400 hover:underline">
          전체 상품 보기
        </Link>
      </div>
    </div>
  );
}
