"use client";

import { useEffect, useState } from "react";
import { settingsService, Banner } from "@/api/settingsService";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ImagePlus, Trash2, GripVertical } from "lucide-react";

export default function AdminSettingsPage() {
  const [bundleFreeThreshold, setBundleFreeThreshold] = useState("");
  const [banners, setBanners] = useState<Banner[]>([]);
  const [savedThreshold, setSavedThreshold] = useState("");
  const [savedBanners, setSavedBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBannerUploading, setIsBannerUploading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const isDirty =
    bundleFreeThreshold !== savedThreshold ||
    JSON.stringify(banners) !== JSON.stringify(savedBanners);

  useEffect(() => {
    settingsService
      .getSettings()
      .then((s) => {
        const threshold = String(s.bundleFreeThreshold);
        const bannerList = s.banners ?? [];
        setBundleFreeThreshold(threshold);
        setBanners(bannerList);
        setSavedThreshold(threshold);
        setSavedBanners(bannerList);
      })
      .catch(() => setLoadError(true))
      .finally(() => setIsLoading(false));
  }, []);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setIsBannerUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBanners((prev) => [...prev, { imageUrl: data.url, linkUrl: "" }]);
    } catch {
      toast.error("이미지 업로드에 실패했습니다.");
    } finally {
      setIsBannerUploading(false);
    }
  };

  const updateBannerLink = (index: number, linkUrl: string) => {
    setBanners((prev) =>
      prev.map((b, i) => (i === index ? { ...b, linkUrl } : b)),
    );
  };

  const removeBanner = (index: number) => {
    setBanners((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(bundleFreeThreshold);
    if (isNaN(value) || value < 0) {
      toast.error("0 이상의 숫자를 입력해주세요.");
      return;
    }
    setIsSubmitting(true);
    try {
      await settingsService.updateSettings({
        bundleFreeThreshold: value,
        banners,
      });
      setSavedThreshold(String(value));
      setSavedBanners(banners);
      toast.success("설정이 저장됐습니다.");
    } catch {
      toast.error("저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-foreground mb-6 text-xl font-bold">사이트 설정</h1>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <div className="border-t-brand-blue h-6 w-6 animate-spin rounded-full border-2 border-gray-200" />
        </div>
      ) : loadError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-10 text-center">
          <p className="text-sm text-red-600">
            설정을 불러오는 데 실패했습니다.
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="mt-3 border-red-300 text-red-600 hover:bg-red-100"
          >
            다시 시도
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 묶음배송 설정 */}
          <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700">배송 설정</h2>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
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
                묶음배송 가능 상품의 합계가 이 금액 이상이면 배송비가 무료로
                처리됩니다.
              </p>
            </div>
          </div>

          {/* 메인 배너 설정 */}
          <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">
                메인 배너
                <span className="ml-1.5 text-xs font-normal text-gray-400">
                  ({banners.length}개)
                </span>
              </h2>
              <label
                className={`flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 ${
                  isBannerUploading ? "pointer-events-none opacity-50" : ""
                }`}
              >
                <ImagePlus className="size-3.5" />
                {isBannerUploading ? "업로드 중..." : "이미지 추가"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBannerUpload}
                  disabled={isBannerUploading}
                />
              </label>
            </div>

            {banners.length === 0 ? (
              <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-gray-200 text-xs text-gray-400">
                배너 이미지를 추가해주세요
              </div>
            ) : (
              <div className="space-y-3">
                {banners.map((banner, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3"
                  >
                    <GripVertical className="size-4 shrink-0 text-gray-300" />
                    <img
                      src={banner.imageUrl}
                      alt={`배너 ${i + 1}`}
                      className="h-14 w-24 shrink-0 rounded-md border border-gray-200 object-cover"
                    />
                    <div className="flex flex-1 flex-col gap-1.5">
                      <Label className="text-xs text-gray-500">
                        링크 URL (선택)
                      </Label>
                      <Input
                        type="url"
                        value={banner.linkUrl ?? ""}
                        onChange={(e) => updateBannerLink(i, e.target.value)}
                        placeholder="https://example.com"
                        className="h-8 text-xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeBanner(i)}
                      className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                      aria-label="배너 삭제"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-400">
              배너는 등록된 순서대로 캐러셀에 표시됩니다. 권장 이미지 사이즈:{" "}
              <span className="font-medium text-gray-500">1280 × 400px</span>
            </p>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="disabled:bg-gray-300 disabled:text-gray-600"
          >
            {isSubmitting ? "저장 중..." : "저장"}
          </Button>
        </form>
      )}
    </div>
  );
}
