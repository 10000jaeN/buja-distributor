"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popup, PopupFormData } from "@/api/popupService";
import { couponService, Coupon } from "@/api/couponService";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PopupFormData) => Promise<void>;
  initial?: Popup | null;
  isSubmitting: boolean;
};

const EMPTY: PopupFormData = {
  title: "",
  imageUrl: "",
  linkUrl: null,
  couponCode: null,
  isActive: true,
  startDate: null,
  endDate: null,
};

type ActionType = "link" | "coupon" | "none";

export default function PopupFormDialog({ open, onClose, onSubmit, initial, isSubmitting }: Props) {
  const [form, setForm] = useState<PopupFormData>(EMPTY);
  const [actionType, setActionType] = useState<ActionType>("none");
  const [isUploading, setIsUploading] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && coupons.length === 0) {
      couponService.getAll().then(setCoupons).catch(() => {});
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title,
        imageUrl: initial.imageUrl,
        linkUrl: initial.linkUrl,
        couponCode: initial.couponCode,
        isActive: initial.isActive,
        startDate: initial.startDate ? initial.startDate.slice(0, 16) : null,
        endDate: initial.endDate ? initial.endDate.slice(0, 16) : null,
      });
      if (initial.linkUrl) setActionType("link");
      else if (initial.couponCode) setActionType("coupon");
      else setActionType("none");
    } else {
      setForm(EMPTY);
      setActionType("none");
    }
  }, [initial, open]);

  if (!open) return null;

  const set = <K extends keyof PopupFormData>(key: K, value: PopupFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleActionTypeChange = (type: ActionType) => {
    setActionType(type);
    if (type === "link") setForm((prev) => ({ ...prev, couponCode: null }));
    if (type === "coupon") setForm((prev) => ({ ...prev, linkUrl: null }));
    if (type === "none") setForm((prev) => ({ ...prev, linkUrl: null, couponCode: null }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const token =
        localStorage.getItem("accessToken") ?? sessionStorage.getItem("accessToken");
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      if (!res.ok) throw new Error("업로드 실패");
      const { url } = await res.json();
      set("imageUrl", url);
    } catch {
      alert("이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  const isEdit = !!initial;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-800">
            {isEdit ? "팝업 수정" : "팝업 생성"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto p-6" style={{ maxHeight: "75vh" }}>
          {/* 제목 */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">제목 (관리용) *</Label>
            <Input
              required
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="여름 시즌 이벤트"
            />
          </div>

          {/* 이미지 업로드 */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">팝업 이미지 *</Label>
            {form.imageUrl ? (
              <div className="relative">
                <Image
                  src={form.imageUrl}
                  alt="팝업 미리보기"
                  width={400}
                  height={400}
                  className="w-full rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => { set("imageUrl", ""); if (fileRef.current) fileRef.current.value = ""; }}
                  className="absolute top-2 right-2 rounded-md bg-black/50 px-2 py-1 text-xs text-white hover:bg-black/70"
                >
                  변경
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={isUploading}
                className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-200 py-8 text-gray-400 transition-colors hover:border-brand-blue hover:text-brand-blue disabled:opacity-50"
              >
                <Upload className="h-6 w-6" />
                <span className="text-sm">{isUploading ? "업로드 중..." : "클릭하여 이미지 업로드"}</span>
                <span className="text-xs">JPG, PNG, WEBP · 최대 5MB</span>
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          {/* 클릭 액션 선택 */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">클릭 액션</Label>
            <div className="flex gap-2">
              {(["none", "link", "coupon"] as ActionType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleActionTypeChange(t)}
                  className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                    actionType === t
                      ? "border-brand-blue bg-brand-blue text-white"
                      : "border-gray-200 text-gray-600 hover:border-brand-blue"
                  }`}
                >
                  {t === "none" ? "없음" : t === "link" ? "링크 이동" : "쿠폰 자동 발급"}
                </button>
              ))}
            </div>
          </div>

          {actionType === "link" && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">이동 URL</Label>
              <Input
                type="url"
                value={form.linkUrl ?? ""}
                onChange={(e) => set("linkUrl", e.target.value || null)}
                placeholder="https://example.com/event"
              />
            </div>
          )}

          {actionType === "coupon" && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">쿠폰 선택</Label>
              <select
                value={form.couponCode ?? ""}
                onChange={(e) => set("couponCode", e.target.value || null)}
                className="h-9 w-full rounded-md border border-gray-200 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="">쿠폰을 선택하세요</option>
                {coupons
                  .filter((c) => c.isActive)
                  .map((c) => (
                    <option key={c._id} value={c.code}>
                      {c.name} ({c.code}) — {c.type === "percentage" ? `${c.value}%` : `${c.value.toLocaleString()}원`} 할인
                    </option>
                  ))}
              </select>
              <p className="text-xs text-gray-400">팝업 클릭 시 유저 쿠폰함에 자동 등록됩니다.</p>
            </div>
          )}

          {/* 노출 기간 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">시작일</Label>
              <Input
                type="datetime-local"
                value={form.startDate ?? ""}
                onChange={(e) => set("startDate", e.target.value || null)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">종료일</Label>
              <Input
                type="datetime-local"
                value={form.endDate ?? ""}
                onChange={(e) => set("endDate", e.target.value || null)}
              />
            </div>
          </div>
          <p className="text-xs text-gray-400">미입력 시 무기한 노출</p>

          {/* 활성화 */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="popupActive"
              checked={form.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 accent-brand-blue"
            />
            <Label htmlFor="popupActive" className="cursor-pointer text-sm text-gray-700">
              활성화
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting || isUploading}>
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading || !form.imageUrl}>
              {isSubmitting ? "저장 중..." : isEdit ? "수정" : "생성"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
