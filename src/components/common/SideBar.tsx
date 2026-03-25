"use client";

import { CancelIcon, Logo } from "@/assets";
import useAuthStore from "@/store/useAuthStore";
import useMenuStore from "@/store/useMenuStore";
import { MenuItem } from "@/types/menu";
import Link from "next/link";
import { useEffect, useState } from "react";

const SideBar = ({ menu }: { menu: MenuItem[] }) => {
  const { isOpen, closeMenu } = useMenuStore();
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const { isLoggedIn, logout, user } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const handleClickLogout = () => {
    logout();
    closeMenu();
  };

  const toggleItem = (label: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  };

  const initials = user?.nickName ? user.nickName.charAt(0).toUpperCase() : "U";

  return (
    <>
      <div
        className={`fixed inset-0 z-100 bg-black/50 transition-opacity duration-300 ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={closeMenu}
      />

      <aside
        className={`fixed top-0 left-0 z-100 flex h-full w-[80vw] max-w-80 flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <Link href={"/"} onClick={closeMenu}>
            <Logo className="flex" />
          </Link>
          <button
            aria-label="메뉴 닫기"
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-200 hover:bg-gray-100"
            onClick={closeMenu}
          >
            <CancelIcon className="h-4 w-4" />
          </button>
        </div>

        {/* 스크롤 가능한 본문 */}
        <div className="no-scrollbar flex-1 overflow-auto">
          {/* 유저 섹션 */}
          <div className="px-5 py-5">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-blue text-sm font-bold text-white">
                  {initials}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900">
                    {user?.nickName}
                  </span>
                  <span className="text-xs text-gray-400">환영합니다</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="mb-1 text-xs text-gray-400">
                  로그인하고 더 많은 혜택을 누려보세요
                </p>
                <div className="flex gap-2">
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="flex-1 rounded-lg bg-brand-blue py-2 text-center text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-blue-dark"
                  >
                    로그인
                  </Link>
                  <Link
                    href="/signup"
                    onClick={closeMenu}
                    className="flex-1 rounded-lg border border-gray-200 py-2 text-center text-sm font-semibold text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                  >
                    회원가입
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="h-px bg-gray-100" />

          {/* 메인 메뉴 */}
          <ul className="flex flex-col px-3 py-3">
            {menu.map((item) => (
              <li key={item.label}>
                {item.children ? (
                  <>
                    <button
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-800 transition-colors duration-200 hover:bg-gray-50"
                      onClick={() => toggleItem(item.label)}
                    >
                      <span>{item.label}</span>
                      <span className={`text-gray-400 transition-transform duration-200 ${openItems.has(item.label) ? "rotate-180" : ""}`}>
                        ▾
                      </span>
                    </button>

                    {openItems.has(item.label) && (
                      <ul className="mt-0.5 flex flex-col">
                        {item.children.map((child) => (
                          <li key={child.label}>
                            <div
                              className="flex cursor-pointer items-center justify-between rounded-lg py-2 pr-3 pl-6 transition-colors duration-200 hover:bg-gray-50"
                              onClick={() => toggleItem(child.label)}
                            >
                              {child.href && (
                                <Link
                                  href={child.href}
                                  className="flex-1 text-sm font-medium text-gray-700"
                                  onClick={(e) => { e.stopPropagation(); closeMenu(); }}
                                >
                                  {child.label}
                                </Link>
                              )}
                              {child.children && child.children.length > 0 && (
                                <span className={`text-xs text-gray-400 transition-transform duration-200 ${openItems.has(child.label) ? "rotate-180" : ""}`}>
                                  ▾
                                </span>
                              )}
                            </div>

                            {child.children && openItems.has(child.label) && (
                              <ul className="flex flex-col">
                                {child.children.map((grandchild) => (
                                  <li key={grandchild.label}>
                                    <Link
                                      href={grandchild.href ?? "#"}
                                      className="block rounded-lg py-2 pr-3 pl-10 text-sm text-gray-500 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-800"
                                      onClick={closeMenu}
                                    >
                                      {grandchild.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href ?? "#"}
                    onClick={closeMenu}
                    className="flex items-center rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-800 transition-colors duration-200 hover:bg-gray-50"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* 하단 고정 영역 (로그인 상태일 때) */}
        {isLoggedIn && (
          <div className="border-t border-gray-100 px-5 py-4">
            <button
              onClick={handleClickLogout}
              className="w-full rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-500 transition-colors duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-500"
            >
              로그아웃
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default SideBar;
