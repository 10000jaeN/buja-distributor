"use client";

import { MonthlyStats } from "@/api/statsService";
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp } from "lucide-react";

interface Props {
  stats: MonthlyStats | null;
  monthlyError: boolean;
  onMonthlyRetry: () => void;
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
  isCurrentMonth: boolean;
}

const fmt = (n: number) => n.toLocaleString();

const ITEMS = [
  { label: "총 매출", key: "totalRevenue" as const, desc: "상품 매출 + 배송비", highlight: true },
  { label: "상품 매출", key: "productRevenue" as const, desc: "배송비 제외 순 상품 금액" },
  { label: "배송비 합계", key: "shippingRevenue" as const, desc: "수취한 배송비 총액" },
  { label: "주문 건수", key: "orderCount" as const, desc: "결제 완료 이상 기준", unit: "건" },
  { label: "취소 건수", key: "cancelledCount" as const, desc: "해당 월 취소된 주문", unit: "건", warn: true },
  { label: "평균 주문금액", key: "averageOrderValue" as const, desc: "총 매출 ÷ 주문 건수" },
];

const MONTH_NAMES = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

export default function MonthlySummaryCard({ stats, monthlyError, onMonthlyRetry, year, month, onPrev, onNext, isCurrentMonth }: Props) {
  const growthRate = stats?.revenueGrowthRate;
  const isPositive = growthRate !== null && growthRate !== undefined && growthRate > 0;
  const isNegative = growthRate !== null && growthRate !== undefined && growthRate < 0;
  const unprocessedOrders = stats?.unprocessedOrders ?? [];

  return (
    <div className="flex flex-col gap-4">
      {/* 미처리 주문 알림 */}
      {unprocessedOrders.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-semibold text-amber-700">
            ⚠ 미처리 주문 {unprocessedOrders.length}건 — 결제 완료 후 1일 이상 경과
          </p>
          <ul className="mt-1.5 space-y-0.5">
            {unprocessedOrders.map((o) => (
              <li key={o.orderNumber} className="flex items-center justify-between text-xs text-amber-600">
                <span className="font-mono">{o.orderNumber}</span>
                <span>{o.totalAmount.toLocaleString()}원 · {new Date(o.paidAt).toLocaleDateString("ko-KR")}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 매출 요약 카드 */}
      <div className="flex h-[540px] flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        {/* 헤더 */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-700">월별 매출 요약</h2>
            <p className="mt-0.5 text-xs text-gray-400">세무·정산 참고용</p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={onPrev} className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[72px] text-center text-sm font-medium text-gray-700">
              {year}년 {MONTH_NAMES[month - 1]}
            </span>
            <button
              onClick={onNext}
              disabled={isCurrentMonth}
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 전월 대비 증감률 */}
        {stats && (
          <div className={`mb-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
            isPositive ? "bg-green-50 text-green-700" : isNegative ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-500"
          }`}>
            {isPositive ? <TrendingUp className="h-4 w-4" /> : isNegative ? <TrendingDown className="h-4 w-4" /> : null}
            <span>
              전월 대비{" "}
              {growthRate === null ? (
                <span className="font-bold">전월 데이터 없음</span>
              ) : (
                <>
                  <span className="font-bold">{isPositive ? "+" : ""}{Math.round(growthRate)}%</span>
                  <span className="ml-2 text-xs font-normal opacity-70">
                    (전월 {fmt(stats.prevTotalRevenue)}원 · {fmt(stats.prevOrderCount)}건)
                  </span>
                </>
              )}
            </span>
          </div>
        )}

        {/* 항목 목록 */}
        {stats === null ? (
          monthlyError ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2">
              <p className="text-sm text-red-500">데이터를 불러오지 못했습니다.</p>
              <button
                onClick={onMonthlyRetry}
                className="text-sm text-brand-blue underline underline-offset-2"
              >
                다시 시도
              </button>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-brand-blue" />
            </div>
          )
        ) : (
          <div className="flex flex-1 flex-col divide-y divide-gray-100">
            {ITEMS.map(({ label, key, desc, unit, highlight, warn }) => {
              const value = stats[key] as number;
              const isAmount = unit === undefined;
              return (
                <div key={key} className={`flex items-center justify-between py-3 ${highlight ? "rounded-lg bg-blue-50/60 px-2" : ""}`}>
                  <div>
                    <p className={`text-sm font-medium ${highlight ? "text-brand-blue" : "text-gray-700"}`}>{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                  <p className={`text-base font-bold ${highlight ? "text-brand-blue" : warn && value > 0 ? "text-red-500" : "text-gray-800"}`}>
                    {isAmount ? `${fmt(value)}원` : `${fmt(value)}${unit}`}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
