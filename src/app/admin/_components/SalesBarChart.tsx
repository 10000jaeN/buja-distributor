"use client";

import { MonthlySale } from "@/api/statsService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MONTH_LABELS = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

function buildChartData(monthlySales: MonthlySale[]) {
  return MONTH_LABELS.map((label, i) => {
    const found = monthlySales.find((s) => s._id === i + 1);
    return {
      month: label,
      revenue: found?.revenue ?? 0,
      orders: found?.orders ?? 0,
    };
  });
}

function formatRevenue(value: number) {
  if (value >= 10000) return `${(value / 10000).toFixed(0)}만`;
  return value.toLocaleString();
}

interface Props {
  monthlySales: MonthlySale[];
  year: number;
  onYearChange: (year: number) => void;
}

export default function SalesBarChart({ monthlySales, year, onYearChange }: Props) {
  const data = buildChartData(monthlySales);
  const totalRevenue = monthlySales.reduce((sum, s) => sum + s.revenue, 0);
  const totalOrders = monthlySales.reduce((sum, s) => sum + s.orders, 0);
  const currentYear = new Date().getFullYear();

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">총 매출</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {totalRevenue.toLocaleString()}
            <span className="ml-1 text-base font-medium text-gray-400">원</span>
          </p>
          <p className="mt-0.5 text-sm text-gray-400">주문 {totalOrders.toLocaleString()}건</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-1">
          <button
            onClick={() => onYearChange(year - 1)}
            disabled={year <= currentYear - 3}
            className="rounded px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-30"
          >
            ‹
          </button>
          <span className="min-w-12 text-center text-sm font-semibold text-gray-700">
            {year}년
          </span>
          <button
            onClick={() => onYearChange(year + 1)}
            disabled={year >= currentYear}
            className="rounded px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-30"
          >
            ›
          </button>
        </div>
      </div>

      <div className="[&_*:focus]:outline-none">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={28} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#f3f4f6" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatRevenue}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            formatter={(value) => [`${Number(value).toLocaleString()}원`, "매출"]}
            labelStyle={{ color: "#374151", fontWeight: 600 }}
            contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }}
            cursor={{ fill: "#f9fafb" }}
          />
          <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} activeBar={false} />
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}
