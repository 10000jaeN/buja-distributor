"use client";

import { useEffect, useState } from "react";
import { statsService, OrderStats, MonthlyStats } from "@/api/statsService";
import CategoryPieChart from "../../_components/CategoryPieChart";
import ProductRankingTable from "../../_components/ProductRankingTable";
import MonthlySummaryCard from "../../_components/MonthlySummaryCard";
import { toast } from "sonner";

const EMPTY_STATS: OrderStats = {
  monthlySales: [],
  productRanking: [],
  categoryRevenue: [],
};

export default function DashboardClient() {
  const now = new Date();
  const year = now.getFullYear();
  const [stats, setStats] = useState<OrderStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  const [monthlyYear, setMonthlyYear] = useState(now.getFullYear());
  const [monthlyMonth, setMonthlyMonth] = useState(now.getMonth() + 1);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null);
  const [monthlyError, setMonthlyError] = useState(false);
  const [monthlyRetry, setMonthlyRetry] = useState(0);

  const isCurrentMonth =
    monthlyYear === now.getFullYear() && monthlyMonth === now.getMonth() + 1;

  const handlePrevMonth = () => {
    if (monthlyMonth === 1) {
      setMonthlyYear((y) => y - 1);
      setMonthlyMonth(12);
    } else {
      setMonthlyMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (isCurrentMonth) return;
    if (monthlyMonth === 12) {
      setMonthlyYear((y) => y + 1);
      setMonthlyMonth(1);
    } else {
      setMonthlyMonth((m) => m + 1);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(false);
    statsService
      .getOrderStats(year)
      .then(setStats)
      .catch(() => {
        setError(true);
        toast.error("통계 데이터를 불러오는 데 실패했습니다.");
      })
      .finally(() => setLoading(false));
  }, [retry]);

  useEffect(() => {
    setMonthlyStats(null);
    setMonthlyError(false);
    statsService
      .getMonthlyStats(monthlyYear, monthlyMonth)
      .then(setMonthlyStats)
      .catch(() => {
        setMonthlyError(true);
        toast.error("월별 통계를 불러오는 데 실패했습니다.");
      });
  }, [monthlyYear, monthlyMonth, monthlyRetry]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-red-500">통계 데이터를 불러오지 못했습니다.</p>
        <button
          onClick={() => setRetry((r) => r + 1)}
          className="mt-3 text-sm text-brand-blue underline underline-offset-2"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${loading ? "opacity-50 transition-opacity" : "transition-opacity"}`}>
      {/* 월 매출 요약 + 카테고리별 매출 */}
      <div className="grid grid-cols-2 gap-6">
        <MonthlySummaryCard
          stats={monthlyStats}
          monthlyError={monthlyError}
          onMonthlyRetry={() => setMonthlyRetry((r) => r + 1)}
          year={monthlyYear}
          month={monthlyMonth}
          onPrev={handlePrevMonth}
          onNext={handleNextMonth}
          isCurrentMonth={isCurrentMonth}
        />
        <CategoryPieChart categoryRevenue={stats.categoryRevenue} />
      </div>

      {/* 상품 순위 */}
      <ProductRankingTable productRanking={stats.productRanking} />
    </div>
  );
}
