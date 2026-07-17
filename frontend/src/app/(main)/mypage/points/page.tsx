"use client";

import { useCallback, useEffect, useState } from "react";
import { pointService, PointTransaction, PointHistoryResult } from "@/api/pointService";
import { toast } from "sonner";
import { Coins } from "lucide-react";
import { Button } from "@/components/ui/button";

const TYPE_LABEL: Record<string, string> = {
  earn: "적립",
  spend: "사용",
  expire: "소멸",
  cancel: "환불",
};

const TYPE_COLOR: Record<string, string> = {
  earn: "text-green-600",
  spend: "text-red-500",
  expire: "text-gray-400",
  cancel: "text-blue-500",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function PointsPage() {
  const [data, setData] = useState<PointHistoryResult | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = useCallback(async (p: number) => {
    setIsLoading(true);
    try {
      const res = await pointService.getHistory(p, 20);
      setData(res);
    } catch {
      toast.error("포인트 내역을 불러오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(page);
  }, [page, fetchHistory]);

  return (
    <div className="space-y-4">
      {/* 잔액 카드 */}
      <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
          <Coins className="size-6 text-brand-blue" />
        </div>
        <div>
          <p className="text-xs text-gray-500">보유 포인트</p>
          <p className="text-2xl font-bold text-gray-900">
            {data ? `${data.balance.toLocaleString()}P` : "-"}
          </p>
        </div>
      </div>

      {/* 내역 */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-gray-700">포인트 내역</h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-brand-blue" />
          </div>
        ) : !data || data.transactions.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-gray-400">
            포인트 내역이 없습니다.
          </div>
        ) : (
          <>
            <ul className="divide-y divide-gray-100">
              {data.transactions.map((tx: PointTransaction) => (
                <li key={tx._id} className="flex items-center justify-between px-6 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-gray-800">{tx.reason}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{formatDate(tx.createdAt)}</p>
                  </div>
                  <div className="ml-4 shrink-0 text-right">
                    <p className={`text-sm font-semibold ${TYPE_COLOR[tx.type]}`}>
                      {tx.type === "earn" || tx.type === "cancel" ? "+" : "-"}{tx.amount.toLocaleString()}P
                    </p>
                    <p className="text-xs text-gray-400">{TYPE_LABEL[tx.type]} · 잔액 {tx.balance.toLocaleString()}P</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* 페이지네이션 */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 border-t border-gray-100 px-6 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page <= 1}
                >
                  이전
                </Button>
                <span className="text-sm text-gray-500">{page} / {data.totalPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= data.totalPages}
                >
                  다음
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
