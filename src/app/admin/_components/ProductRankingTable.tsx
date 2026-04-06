"use client";

import { useState } from "react";
import { ProductRank } from "@/api/statsService";

type SortKey = "quantity" | "revenue";

const RANK_COLOR = ["text-yellow-500", "text-gray-400", "text-amber-600"];

interface Props {
  productRanking: ProductRank[];
}

export default function ProductRankingTable({ productRanking }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("quantity");

  const sorted = [...productRanking].sort((a, b) => b[sortKey] - a[sortKey]);

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold tracking-wider text-gray-400 uppercase">상품 판매 순위</p>
          <p className="text-sm text-gray-500">전체 기간 기준</p>
        </div>
        <div className="flex rounded-lg border border-gray-200 p-0.5">
          {(["quantity", "revenue"] as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setSortKey(key)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                sortKey === key
                  ? "bg-brand-blue text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {key === "quantity" ? "판매량" : "매출"}
            </button>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">데이터가 없습니다</p>
      ) : (
        <div className="space-y-1">
          {sorted.map((product, i) => (
            <div
              key={product._id}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-gray-50"
            >
              <span
                className={`w-5 shrink-0 text-center text-sm font-bold tabular-nums ${
                  RANK_COLOR[i] ?? "text-gray-300"
                }`}
              >
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">
                {product.name}
              </span>
              <div className="text-right">
                <p className="text-sm font-semibold tabular-nums text-gray-700">
                  {sortKey === "quantity"
                    ? `${product.quantity.toLocaleString()}개`
                    : `${product.revenue.toLocaleString()}원`}
                </p>
                <p className="text-xs tabular-nums text-gray-400">
                  {sortKey === "quantity"
                    ? `${product.revenue.toLocaleString()}원`
                    : `${product.quantity.toLocaleString()}개`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
