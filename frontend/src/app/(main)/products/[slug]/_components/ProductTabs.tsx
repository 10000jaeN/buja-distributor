"use client";

import { useRef, useState } from "react";
import { NAV_HEIGHT } from "@/constants/layout";
import { ProductDetailTab } from "./ProductDetailTab";
import { ProductQnATab } from "./ProductQnATab";
import { ProductReviewTab } from "./ProductReviewTab";
import { ProductShippingTab } from "./ProductShippingTab";

type ContentBlock = {
  type: "text" | "image";
  value: string;
};

type Props = {
  productId: string;
  productName: string;
  content?: string;
  contentBlock: ContentBlock[];
  shippingFee: number;
  freeShippingThreshold: number;
};

const TABS = ["상세정보", "Q&A", "상품 리뷰", "배송정보"] as const;
type Tab = (typeof TABS)[number];

export function ProductTabs({
  productId,
  productName,
  content,
  contentBlock,
  shippingFee,
  freeShippingThreshold,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("상세정보");
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab);
    if (containerRef.current) {
      const top = containerRef.current.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <div ref={containerRef}>
      {/* 탭 툴바 */}
      <div
        aria-label="ToolBar"
        className="sticky top-[var(--nav-height)] z-40 flex justify-around border-b border-gray-200 bg-white"
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => handleTabClick(tab)}
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
      <div className="mx-auto max-w-200 lg:min-h-[480px]">
        {activeTab === "상세정보" && (
          <ProductDetailTab content={content} contentBlock={contentBlock} />
        )}
        {activeTab === "Q&A" && (
          <ProductQnATab productId={productId} productName={productName} />
        )}
        {activeTab === "상품 리뷰" && (
          <ProductReviewTab productId={productId} />
        )}
        {activeTab === "배송정보" && (
          <ProductShippingTab
            shippingFee={shippingFee}
            freeShippingThreshold={freeShippingThreshold}
          />
        )}
      </div>
    </div>
  );
}
