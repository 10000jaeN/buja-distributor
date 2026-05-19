"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import noImage from "@/public/images/no-image.png";
import { Star } from "lucide-react";

type PreviewData = {
  name: string;
  price: string;
  shippingType: string;
  shippingFee: string;
  freeShippingThreshold: string;
  thumbnail: string;
  content: string;
};

const TABS = ["상세정보", "Q&A", "상품 리뷰", "배송정보"] as const;

export default function PreviewPage() {
  const [data, setData] = useState<PreviewData | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("product-preview-data");
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch {
        setData(null);
      }
    }
  }, []);

  if (!data) return null;

  const price = Number(data.price) || 0;
  const shippingFee = data.shippingType === "free" ? 0 : Number(data.shippingFee) || 3000;
  const freeShippingThreshold =
    data.shippingType === "bundle" ? Number(data.freeShippingThreshold) || 0 : 0;

  return (
    <main className="pb-24 md:pb-0">
      {/* 미리보기 배너 */}
      <div className="flex items-center justify-center bg-amber-400 px-4 py-1.5 text-xs font-medium text-amber-900">
        미리보기 모드 — 실제 저장된 상품이 아닙니다
      </div>

      {/* 상품 정보 영역 */}
      <div className="mx-auto max-w-[1024px] md:grid md:grid-cols-[320px_1fr] md:items-stretch md:gap-8 md:px-5 md:py-8 lg:grid-cols-[460px_1fr] lg:gap-12 lg:py-10">
        {/* 썸네일 */}
        <div className="w-full overflow-hidden bg-gray-50 md:shrink-0 md:rounded-2xl lg:w-[460px]">
          <Image
            src={data.thumbnail || noImage}
            alt="thumbnail"
            className="mx-auto w-full object-cover"
            width={800}
            height={800}
          />
        </div>

        {/* 상품 정보 섹션 */}
        <div className="px-4 pt-5 pb-4 md:flex md:flex-col md:justify-between md:px-0 md:pt-0 md:pb-0">
          {/* 별점 */}
          <div aria-label="별점" className="flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium text-amber-500">0.0</span>
            <span className="text-sm text-gray-400">｜ 후기 0개</span>
          </div>

          {/* 상품명 */}
          <h1 className="mt-3 text-xl leading-snug font-bold text-gray-900 md:text-xl lg:text-2xl">
            {data.name || <span className="text-gray-300">상품명 미입력</span>}
          </h1>

          <hr className="mt-5 border-gray-200" />

          {/* 가격 */}
          <dl className="mt-5 flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-500">판매가</dt>
              <dd className="text-brand-blue text-2xl font-bold md:text-2xl lg:text-3xl">
                {price.toLocaleString()}원
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-500">배송비</dt>
              <dd className="text-sm font-medium text-gray-700">
                {shippingFee === 0 ? (
                  <span className="text-brand-blue">무료</span>
                ) : (
                  <>
                    {shippingFee.toLocaleString()}원
                    {freeShippingThreshold > 0 && (
                      <span className="ml-1.5 text-xs text-gray-400">
                        ({freeShippingThreshold.toLocaleString()}원 이상 무료)
                      </span>
                    )}
                  </>
                )}
              </dd>
            </div>
          </dl>

          <hr className="mt-5 border-gray-100" />

          {/* 수량 + 구매 버튼 (비활성) */}
          <div className="mt-6 hidden opacity-50 pointer-events-none lg:block">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-500">수량</span>
              <div className="flex items-center gap-3">
                <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-lg text-gray-600">-</button>
                <span className="min-w-[28px] text-center text-base font-medium text-gray-800">1</span>
                <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-lg text-gray-600">+</button>
              </div>
            </div>
            <div className="mt-4 space-y-2 rounded-xl bg-gray-50 px-4 py-3">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>배송비</span>
                <span>{shippingFee === 0 ? <span className="text-brand-blue font-medium">무료</span> : `${shippingFee.toLocaleString()}원`}</span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-2">
                <span className="text-sm text-gray-500">총 결제금액</span>
                <span className="text-brand-blue text-xl font-bold">{(price + shippingFee).toLocaleString()}원</span>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button className="flex-1 rounded-xl border border-gray-300 bg-white py-4 text-sm font-semibold text-gray-700">장바구니</button>
              <button className="bg-brand-blue flex-1 rounded-xl py-4 text-sm font-semibold text-white">구매하기</button>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div
        aria-label="ToolBar"
        className="sticky top-17.25 z-40 flex justify-around border-b border-gray-200 bg-white"
      >
        {TABS.map((tab) => (
          <div
            key={tab}
            className={`flex-1 border-b-2 py-3 text-center text-sm ${
              tab === "상세정보"
                ? "border-brand-blue text-brand-blue font-semibold"
                : "border-transparent text-gray-300"
            }`}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* 상세 콘텐츠 */}
      <div className="mx-auto max-w-200">
        {data.content ? (
          <div
            className="product-content px-4 py-6"
            dangerouslySetInnerHTML={{ __html: data.content }}
          />
        ) : (
          <div className="flex flex-col items-center gap-4 px-4 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">상세 정보가 아직 입력되지 않았습니다.</p>
              <p className="text-xs text-gray-400">에디터에서 내용을 입력하면 여기에 표시됩니다.</p>
            </div>
          </div>
        )}
      </div>

      {/* 모바일 하단 바 (비활성) */}
      <nav className="fixed bottom-0 left-0 z-50 flex h-auto w-full items-center justify-between gap-2 border-t border-gray-200 bg-white px-3 py-2 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] opacity-50 pointer-events-none lg:hidden">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Image
            src={data.thumbnail || noImage}
            alt="thumbnail"
            width={56}
            height={56}
            className="h-14 w-14 shrink-0 rounded-md object-cover"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="truncate text-sm font-medium text-gray-800">{data.name || "상품명"}</p>
            <p className="text-brand-blue text-sm font-bold">{price.toLocaleString()}원</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-1.5">
          <button className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700">장바구니</button>
          <button className="bg-brand-blue rounded-xl px-4 py-2 text-xs font-semibold text-white">구매하기</button>
        </div>
      </nav>
    </main>
  );
}
