"use client";

import { apiClient } from "@/lib/apiClient";
import useAuthStore from "@/store/useAuthStore";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const isAdminRole = (roles?: unknown) => {
  if (!roles) return false;
  if (Array.isArray(roles)) return (roles as string[]).includes("admin");
  return roles === "admin";
};

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "대시보드" },
  { href: "/admin/products", label: "상품 관리" },
  { href: "/admin/categories", label: "카테고리 관리" },
  { href: "/admin/orders", label: "주문 관리" },
  { href: "/admin/users", label: "회원 관리" },
  { href: "/admin/settings", label: "사이트 설정" },
];

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isInitialized, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLoginPage = pathname === "/admin/login";
  const isAdmin = isAdminRole(user?.roles);

  useEffect(() => {
    if (isLoginPage) return;
    if (!isInitialized) return;
    if (!isAdmin) router.replace("/admin/login");
  }, [isInitialized, isAdmin, router, isLoginPage]);

  // 페이지 이동 시 사이드바 닫기
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

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
      await apiClient.post("/auth/logout");
    } finally {
      logout();
      router.push("/admin/login");
    }
  };

  const Sidebar = () => (
    <aside className="flex h-full w-52 flex-shrink-0 flex-col overflow-y-auto bg-gray-900 text-white">
      <div className="border-b border-gray-700 px-5 py-5">
        <span className="text-sm font-bold tracking-tight">부자유통 관리자</span>
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
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* ── 데스크탑 사이드바 ── */}
      <div className="hidden lg:flex lg:h-full lg:w-52 lg:flex-shrink-0">
        <Sidebar />
      </div>

      {/* ── 모바일 드로어 오버레이 ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── 모바일 드로어 사이드바 ── */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-52 transform transition-transform duration-200 lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative h-full">
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-3 z-10 rounded-md p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
          <Sidebar />
        </div>
      </div>

      {/* ── 콘텐츠 영역 ── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            {/* 모바일 햄버거 버튼 */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <p className="text-sm text-gray-400">
              {NAV_ITEMS.find((n) => pathname.startsWith(n.href))?.label ?? "관리자"}
            </p>
          </div>
          <span className="text-sm text-gray-600">{user?.nickName}님</span>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
