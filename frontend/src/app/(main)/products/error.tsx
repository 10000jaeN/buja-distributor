"use client";

export default function ProductsError({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto max-w-[1024px] px-5 py-10">
      <div className="flex min-h-60 flex-col items-center justify-center gap-3">
        <p className="text-gray-400">상품 목록을 불러오지 못했습니다.</p>
        <button
          onClick={reset}
          className="text-brand-blue text-sm hover:underline"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
