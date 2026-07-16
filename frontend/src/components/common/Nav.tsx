"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Menu, Search, ShoppingCart, UserCircle } from "lucide-react";

import { Tooltip } from "@/components/ui/tooltip";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Logo } from "@/assets";
import CategoryNav from "@/components/common/CategoryNav";

import useAuthStore from "@/store/useAuthStore";
import useCartStore from "@/store/useCartStore";
import useMenuStore from "@/store/useMenuStore";
import { MenuItem } from "@/types/menu";
import { USER_MENU } from "@/constants/menu";
import { NAV_HEIGHT } from "@/constants/layout";

const Nav = ({ menu }: { menu: MenuItem[] }) => {
  const [searchOpen, setSearchOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const openMenu = useMenuStore((state) => state.openMenu);
  const { isLoggedIn, isInitialized, logout } = useAuthStore();
  const cartCount = useCartStore((state) => state.count);
  const router = useRouter();

  const userMenuItems = [
    ...USER_MENU,
    { label: "로그아웃", onClick: () => { logout(); router.push("/"); }, variant: "danger" as const, separator: true },
  ];

  const onSearchSubmit = () => {
    const q = inputRef.current?.value.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSearchSubmit();
    if (e.key === "Escape") inputRef.current?.blur();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-300 bg-white">
      <div style={{ height: NAV_HEIGHT }} className="mx-auto flex w-full max-w-[var(--max-width)] items-center justify-between p-5">
        {/* 왼쪽: 햄버거(모바일) + 로고 + 카테고리(PC) */}
        <div className="flex items-center gap-6">
          <Tooltip label="메뉴" className="lg:hidden">
            <Menu
              className="h-6 w-6 hover:cursor-pointer"
              onClick={openMenu}
            />
          </Tooltip>

          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0"
          >
            <Logo className="w-[102px]" shapeRendering="crispEdges" />
          </Link>

          {/* PC 카테고리 메뉴 */}
          <CategoryNav menu={menu} />
        </div>

        {/* 오른쪽: 검색 + 장바구니 + 유저 */}
        <div className="flex items-center gap-3">
          {/* 검색 */}
          <div className="flex items-center">
            {!searchOpen && (
              <Tooltip label="검색" className="lg:hidden">
                <button
                  onClick={() => {
                    setSearchOpen(true);
                    setTimeout(() => inputRef.current?.focus(), 50);
                  }}
                  className="hover:text-brand-blue flex items-center text-gray-600"
                >
                  <Search className="h-6 w-6" />
                </button>
              </Tooltip>
            )}
            <div
              className={`overflow-hidden transition-all duration-300 ${searchOpen ? "w-[calc(100vw-12rem)]" : "w-0"} lg:w-52`}
            >
              <div className="relative">
                <input
                  ref={inputRef}
                  placeholder="검색어를 입력해주세요"
                  onKeyDown={onSearchKeyDown}
                  onBlur={() => setSearchOpen(false)}
                  className="focus:border-brand-blue focus:ring-brand-blue/10 h-9 w-full rounded-full border border-gray-200 bg-gray-50 pr-9 pl-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:ring-2"
                />
                <Search
                  className="hover:text-brand-blue absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 cursor-pointer text-gray-400"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={onSearchSubmit}
                />
              </div>
            </div>
          </div>

          {isInitialized && isLoggedIn ? (
            <>
              <Tooltip label="장바구니">
                <Link
                  href="/cart"
                  className="hover:text-brand-blue relative flex items-center text-gray-600"
                >
                  <ShoppingCart className="h-6 w-6" />
                  {cartCount > 0 && (
                    <span className="bg-brand-blue absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </Link>
              </Tooltip>

              <DropdownMenu
                trigger={<UserCircle className="h-6 w-6" />}
                tooltipLabel="내 계정"
                items={userMenuItems}
              />
            </>
          ) : (
            <Link
              href="/login"
              className="text-[14px] font-bold underline-offset-3 hover:cursor-pointer hover:underline"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Nav;
