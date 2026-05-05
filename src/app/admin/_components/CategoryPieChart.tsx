"use client";

import { CategoryRevenue } from "@/api/statsService";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#14b8a6",
];

interface Props {
  categoryRevenue: CategoryRevenue[];
}

export default function CategoryPieChart({ categoryRevenue }: Props) {
  const total = categoryRevenue.reduce((sum, c) => sum + c.revenue, 0);

  const data = categoryRevenue.map((c) => ({
    name: c._id || "미분류",
    value: c.revenue,
    percent: total > 0 ? ((c.revenue / total) * 100).toFixed(1) : "0",
  }));

  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-gray-100 bg-white p-6">
        <p className="text-sm text-gray-400">데이터가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6">
      <p className="mb-1 text-xs font-semibold tracking-wider text-gray-400 uppercase">
        카테고리별 매출
      </p>
      <p className="mb-2 text-sm text-gray-500">{total.toLocaleString()}원</p>

      <div className="[&_*:focus]:outline-none">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${Number(value).toLocaleString()}원`]}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                fontSize: 13,
              }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value, entry: { payload?: { percent?: string } }) =>
                `${value} ${entry.payload?.percent ?? ""}%`
              }
              wrapperStyle={{ fontSize: 12, paddingTop: 20 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 카테고리별 텍스트 목록 */}
      <div className="mt-4 space-y-2.5 border-t border-gray-100 pt-4">
        {data.map((item, i) => (
          <div key={item.name} className="flex items-center gap-2">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="min-w-0 flex-1 truncate text-sm text-gray-700">
              {item.name}
            </span>
            <span className="text-xs text-gray-400 tabular-nums">
              {item.percent}%
            </span>
            <span className="text-sm font-medium text-gray-700 tabular-nums">
              {item.value.toLocaleString()}원
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
