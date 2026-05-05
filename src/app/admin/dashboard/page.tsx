"use client";

import { useEffect, useState } from "react";
import { statsService, OrderStats } from "@/api/statsService";
import SalesBarChart from "../_components/SalesBarChart";
import CategoryPieChart from "../_components/CategoryPieChart";
import ProductRankingTable from "../_components/ProductRankingTable";
import { toast } from "sonner";

const EMPTY_STATS: OrderStats = {
  monthlySales: [],
  productRanking: [],
  categoryRevenue: [],
};

export default function DashboardPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState<OrderStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

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
  }, [year, retry]);

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
    <div className="space-y-6">
      {/* 매출 막대 그래프 */}
      <div
        className={
          loading ? "opacity-50 transition-opacity" : "transition-opacity"
        }
      >
        <SalesBarChart
          monthlySales={stats.monthlySales}
          year={year}
          onYearChange={setYear}
        />
      </div>

      {/* 카테고리 원형 + 상품 순위 */}
      <div className="grid grid-cols-[1fr_1.5fr] gap-6">
        <CategoryPieChart categoryRevenue={stats.categoryRevenue} />
        <ProductRankingTable productRanking={stats.productRanking} />
      </div>
    </div>
  );
}
