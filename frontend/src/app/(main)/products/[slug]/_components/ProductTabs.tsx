"use client";

import Image from "next/image";
import { useState } from "react";

type ContentBlock = {
  type: "text" | "image";
  value: string;
};

type Props = {
  content?: string;
  contentBlock: ContentBlock[];
  shippingFee: number;
  freeShippingThreshold: number;
};

const TABS = ["상세정보", "Q&A", "상품 리뷰", "배송정보"] as const;
type Tab = (typeof TABS)[number];

function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center gap-4 px-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
    </div>
  );
}

export function ProductTabs({ content, contentBlock, shippingFee, freeShippingThreshold }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("상세정보");

  return (
    <>
      {/* 탭 툴바 */}
      <div
        aria-label="ToolBar"
        className="sticky top-17.25 z-40 flex justify-around border-b border-gray-200 bg-white"
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 border-b-2 py-3 text-sm transition-colors ${
              activeTab === tab
                ? "border-brand-blue text-brand-blue font-semibold"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="mx-auto max-w-200">
        {activeTab === "상세정보" && (
          <>
            {content ? (
              <div
                className="product-content px-4 py-6"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : contentBlock?.length ? (
              /* 구형 데이터 폴백 렌더링 */
              contentBlock.map((block, index) => {
                if (block.type === "image") {
                  return (
                    <Image
                      key={index}
                      src={block.value}
                      alt="상세페이지"
                      width={800}
                      height={800}
                      className="w-full"
                    />
                  );
                }
                return (
                  <div
                    key={index}
                    className="px-4 py-5 text-sm leading-relaxed text-gray-700"
                  >
                    {block.value}
                  </div>
                );
              })
            ) : (
              <EmptyState
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
                title="상세 정보가 아직 등록되지 않았습니다."
                description="상품 문의는 Q&A를 이용해 주세요."
              />
            )}
          </>
        )}

        {activeTab === "Q&A" && (
          <EmptyState
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            title="등록된 Q&A가 없습니다."
            description="궁금한 점은 아래 문의하기 버튼을 이용해 주세요."
          />
        )}

        {activeTab === "상품 리뷰" && (
          <EmptyState
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            }
            title="아직 작성된 리뷰가 없습니다."
            description="구매 후 첫 번째 리뷰를 남겨보세요."
          />
        )}

        {activeTab === "배송정보" && (
          <div className="px-4 py-8 space-y-6 text-sm text-gray-700">
            <section className="space-y-3">
              <h3 className="font-semibold text-gray-900">배송 안내</h3>
              <dl className="space-y-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-4">
                <div className="flex justify-between">
                  <dt className="text-gray-500">배송사</dt>
                  <dd className="font-medium">CJ대한통운</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">배송비</dt>
                  <dd className="font-medium">
                    {shippingFee === 0 ? (
                      <span className="text-brand-blue">무료배송</span>
                    ) : (
                      <>
                        {shippingFee.toLocaleString()}원
                        {freeShippingThreshold > 0 && (
                          <span className="ml-1 text-xs text-gray-400">
                            ({freeShippingThreshold.toLocaleString()}원 이상 무료)
                          </span>
                        )}
                      </>
                    )}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">배송 기간</dt>
                  <dd className="font-medium">결제 완료 후 1~3 영업일</dd>
                </div>
              </dl>
            </section>

            <section className="space-y-3">
              <h3 className="font-semibold text-gray-900">교환 / 반품 안내</h3>
              <dl className="space-y-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-4">
                <div className="flex justify-between">
                  <dt className="text-gray-500">교환/반품 신청</dt>
                  <dd className="font-medium">수령 후 7일 이내</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">반품 배송비</dt>
                  <dd className="font-medium">3,000원 (왕복 6,000원)</dd>
                </div>
              </dl>
              <ul className="space-y-1.5 text-xs text-gray-400 list-disc list-inside">
                <li>단순 변심에 의한 반품 시 배송비는 고객 부담입니다.</li>
                <li>상품 불량 및 오배송의 경우 무료 반품 처리됩니다.</li>
                <li>식품 특성상 개봉 후 반품이 불가합니다.</li>
              </ul>
            </section>
          </div>
        )}
      </div>
    </>
  );
}
