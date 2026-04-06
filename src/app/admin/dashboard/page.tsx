"use client";

import { useEffect, useState } from "react";
import { statsService, OrderStats } from "@/api/statsService";
import SalesBarChart from "../_components/SalesBarChart";
import CategoryPieChart from "../_components/CategoryPieChart";
import ProductRankingTable from "../_components/ProductRankingTable";

const EMPTY_STATS: OrderStats = {
  monthlySales: [],
  productRanking: [],
  categoryRevenue: [],
};

export default function DashboardPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState<OrderStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsService
      .getOrderStats(year)
      .then(setStats)
      .finally(() => setLoading(false));
  }, [year]);

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
