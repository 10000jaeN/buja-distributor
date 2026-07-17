"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { popupService, Popup } from "@/api/popupService";
import { couponService } from "@/api/couponService";
import useAuthStore from "@/store/useAuthStore";
import { toast } from "sonner";

function getDismissKey(id: string) {
  return `popup_dismissed_${id}`;
}

function isDismissedToday(id: string): boolean {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem(getDismissKey(id));
  if (!stored) return false;
  return stored === new Date().toLocaleDateString("sv"); // YYYY-MM-DD
}

function dismissToday(id: string) {
  localStorage.setItem(getDismissKey(id), new Date().toLocaleDateString("sv"));
}

export default function EventPopup() {
  const [popup, setPopup] = useState<Popup | null>(null);
  const [visible, setVisible] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const router = useRouter();

  useEffect(() => {
    popupService.getActive().then((popups) => {
      const next = popups.find((p) => !isDismissedToday(p._id));
      if (next) {
        setPopup(next);
        setVisible(true);
      }
    }).catch(() => {});
  }, []);

  if (!visible || !popup) return null;

  const handleClose = () => setVisible(false);

  const handleDismissToday = () => {
    dismissToday(popup._id);
    setVisible(false);
  };

  const handleCouponClaim = async () => {
    if (!popup.couponCode || claiming) return;
    if (!isLoggedIn) {
      toast.info("쿠폰을 받으려면 로그인이 필요합니다.", {
        action: { label: "로그인", onClick: () => router.push("/login") },
      });
      return;
    }
    setClaiming(true);
    try {
      const res = await couponService.claim(popup.couponCode);
      toast.success(`쿠폰 "${res.coupon.name}"이 쿠폰함에 추가됐습니다.`);
      setVisible(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "쿠폰 등록에 실패했습니다.";
      toast.error(msg);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* 닫기 버튼 */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60"
          aria-label="닫기"
        >
          <X className="h-4 w-4" />
        </button>

        {/* 이미지 */}
        {popup.linkUrl ? (
          <a href={popup.linkUrl} target="_blank" rel="noopener noreferrer" onClick={handleClose}>
            <Image
              src={popup.imageUrl}
              alt={popup.title}
              width={480}
              height={480}
              className="w-full object-cover"
              priority
            />
          </a>
        ) : (
          <Image
            src={popup.imageUrl}
            alt={popup.title}
            width={480}
            height={480}
            className="w-full object-cover"
            priority
          />
        )}

        {/* 하단 버튼 영역 */}
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
          <button
            onClick={handleDismissToday}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            오늘 하루 보지 않기
          </button>

          {popup.couponCode && (
            <button
              onClick={handleCouponClaim}
              disabled={claiming}
              className="rounded-lg bg-brand-blue px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {claiming ? "등록 중..." : "쿠폰 받기"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
