"use client";

import { useEffect, useState } from "react";
import { settingsService } from "@/api/settingsService";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [bundleFreeThreshold, setBundleFreeThreshold] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    settingsService
      .getSettings()
      .then((s) => setBundleFreeThreshold(String(s.bundleFreeThreshold)))
      .catch(() => setLoadError(true))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(bundleFreeThreshold);
    if (isNaN(value) || value < 0) {
      toast.error("0 이상의 숫자를 입력해주세요.");
      return;
    }
    setIsSubmitting(true);
    try {
      await settingsService.updateSettings({ bundleFreeThreshold: value });
      toast.success("설정이 저장됐습니다.");
    } catch {
      toast.error("저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-xl font-bold text-foreground">사이트 설정</h1>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <div className="border-t-brand-blue h-6 w-6 animate-spin rounded-full border-2 border-gray-200" />
        </div>
      ) : loadError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-10 text-center">
          <p className="text-sm text-red-600">설정을 불러오는 데 실패했습니다.</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="mt-3 border-red-300 text-red-600 hover:bg-red-100"
          >
            다시 시도
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-gray-700">
              묶음배송 무료 기준금액 (원)
            </Label>
            <Input
              type="number"
              value={bundleFreeThreshold}
              onChange={(e) => setBundleFreeThreshold(e.target.value)}
              min="0"
              placeholder="50000"
            />
            <p className="text-xs text-gray-400">
              묶음배송 가능 상품의 합계가 이 금액 이상이면 배송비가 무료로 처리됩니다.
            </p>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "저장 중..." : "저장"}
          </Button>
        </form>
      )}
    </div>
  );
}
