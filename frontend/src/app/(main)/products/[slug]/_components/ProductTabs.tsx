"use client";

import { useState } from "react";
import { ProductDetailTab } from "./ProductDetailTab";
import { ProductQnATab } from "./ProductQnATab";
import { ProductReviewTab } from "./ProductReviewTab";
import { ProductShippingTab } from "./ProductShippingTab";

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
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 border-b-2 py-3 text-sm transition-colors ${
              activeTab === tab
                ? "border-brand-blue font-semibold text-brand-blue"
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
          <ProductDetailTab content={content} contentBlock={contentBlock} />
        )}
        {activeTab === "Q&A" && <ProductQnATab />}
        {activeTab === "상품 리뷰" && <ProductReviewTab />}
        {activeTab === "배송정보" && (
          <ProductShippingTab
            shippingFee={shippingFee}
            freeShippingThreshold={freeShippingThreshold}
          />
        )}
      </div>
    </>
  );
}
