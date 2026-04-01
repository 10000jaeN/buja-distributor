"use client";

import axiosInstance from "@/lib/axios";
import useAuthStore from "@/store/useAuthStore";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const isAdminRole = (roles?: unknown) => {
  if (!roles) return false;
  if (Array.isArray(roles)) return (roles as string[]).includes("admin");
  return roles === "admin";
};

const NAV_ITEMS = [
  { href: "/admin/products", label: "상품 관리" },
  { href: "/admin/categories", label: "카테고리 관리" },
];

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isInitialized, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === "/admin/login";
  const isAdmin = isAdminRole(user?.roles);

  useEffect(() => {
    if (isLoginPage) return;
    if (!isInitialized) return;
    if (!isAdmin) router.replace("/admin/login");
  }, [isInitialized, isAdmin, router, isLoginPage]);

  // 로그인 페이지는 쉘 없이 그대로 렌더
  if (isLoginPage) return <>{children}</>;

  if (!isInitialized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-blue" />
          <span className="text-sm text-gray-500">로딩 중...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } finally {
      logout();
      router.push("/admin/login");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* ── 사이드바 ── */}
      <aside className="flex h-full w-52 flex-shrink-0 flex-col overflow-y-auto bg-gray-900 text-white">
        <div className="border-b border-gray-700 px-5 py-5">
          <span className="text-sm font-bold tracking-tight">
            부자유통 관리자
          </span>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-brand-blue text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-0.5 border-t border-gray-700 px-3 py-4">
          <Link
            href="/"
            className="flex items-center rounded-md px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
          >
            홈으로
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
          >
            로그아웃
          </button>
        </div>
      </aside>

      {/* ── 콘텐츠 영역 ── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
          <p className="text-sm text-gray-400">
            {NAV_ITEMS.find((n) => pathname.startsWith(n.href))?.label ??
              "관리자"}
          </p>
          <span className="text-sm text-gray-600">{user?.nickName}님</span>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
