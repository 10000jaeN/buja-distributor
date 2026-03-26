"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "프로필", href: "/mypage" },
  { label: "주문 내역", href: "/mypage/orders" },
];

export default function MypageLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-[1024px] px-5 py-10">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">마이페이지</h1>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* 사이드 네비게이션 */}
        <nav className="lg:w-44">
          <ul className="flex gap-2 rounded-xl border border-gray-100 bg-white p-2 shadow-sm lg:flex-col">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href} className="flex-1 lg:flex-none">
                  <Link
                    href={item.href}
                    className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-brand-blue text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
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
