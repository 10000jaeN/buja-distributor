"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useAuthStore from "@/store/useAuthStore";
import { qnaService } from "@/api/qnaService";

const QNA_LAST_READ_KEY = "qna_last_read";

const NAV_ITEMS = [
  { label: "내 프로필", href: "/mypage" },
  { label: "주문내역", href: "/mypage/orders" },
  { label: "내 리뷰", href: "/mypage/reviews" },
  { label: "내 문의", href: "/mypage/qna" },
  { label: "배송지 관리", href: "/mypage/addresses" },
];

export default function MypageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, isInitialized } = useAuthStore();
  const [qnaUnreadCount, setQnaUnreadCount] = useState(0);

  useEffect(() => {
    if (isInitialized && !isLoggedIn) {
      router.replace("/login");
    }
  }, [isInitialized, isLoggedIn, router]);

  useEffect(() => {
    if (!isLoggedIn) return;

    if (pathname === "/mypage/qna") {
      setQnaUnreadCount(0);
      return;
    }

    const lastRead = localStorage.getItem(QNA_LAST_READ_KEY) ?? undefined;
    qnaService
      .getMyUnreadAnswerCount(lastRead)
      .then(setQnaUnreadCount)
      .catch(() => {});
  }, [pathname, isLoggedIn]);

  if (!isInitialized || !isLoggedIn) {
    return null;
  }

  return (
    <div className="mx-auto max-w-[var(--max-width)] px-5 py-10">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">마이페이지</h1>
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        {/* 사이드 네비게이션 */}
        <nav className="md:w-40 lg:w-44">
          <ul className="flex gap-2 rounded-xl border border-gray-100 bg-white p-2 shadow-sm md:flex-col">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const showBadge = item.href === "/mypage/qna" && qnaUnreadCount > 0;
              return (
                <li key={item.href} className="flex-1 md:flex-none">
                  <Link
                    href={item.href}
                    className={`relative flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors md:justify-start ${
                      isActive
                        ? "bg-brand-blue text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                    {showBadge && (
                      <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                        {qnaUnreadCount > 99 ? "99+" : qnaUnreadCount}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 콘텐츠 */}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
