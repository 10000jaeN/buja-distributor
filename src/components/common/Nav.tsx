"use client";

import { Logo, MenuIcon } from "@/assets";
import useAuthStore from "@/store/useAuthStore";
import useMenuStore from "@/store/useMenuStore";
import { MenuItem } from "@/types/menu";
import { ChevronDown, ShoppingCart } from "lucide-react";
import { Search, UserCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import useCartStore from "@/store/useCartStore";
import { Tooltip } from "@/components/ui/tooltip";

const Nav = ({ menu }: { menu: MenuItem[] }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [activeParent, setActiveParent] = useState<string | null>(null);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navRef = useRef<HTMLUListElement>(null);
  const openMenu = useMenuStore((state) => state.openMenu);
  const { isLoggedIn: loggedIn } = useAuthStore();
  const cartCount = useCartStore((state) => state.count);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
        setActiveParent(null);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setOpenUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onClickSearchIcon = () => {
    setSearchOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

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
      {/* 상단 바 */}
      <div className="mx-auto flex h-17.25 w-full max-w-[1024px] items-center justify-between p-5">
        {/* 왼쪽: 햄버거(모바일) + 로고 + 카테고리(PC) */}
        <div className="flex items-center gap-6">
          <Tooltip label="메뉴" className="lg:hidden">
            <MenuIcon
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

          {/* PC 메뉴 */}
          <ul ref={navRef} className="hidden items-center gap-5 lg:flex">
            {menu.map((item) => {
              const isOpen = openDropdown === item.label;
              return (
                <li key={item.label} className="relative">
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="text-sm font-semibold hover:text-gray-500"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        setOpenDropdown(isOpen ? null : item.label);
                        setActiveParent(null);
                      }}
                      className="flex cursor-pointer items-center gap-1 text-sm font-semibold hover:text-gray-500"
                    >
                      {item.label}
                      {item.children && (
                        <ChevronDown
                          className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                        />
                      )}
                    </button>
                  )}

                  {item.children && item.children.length > 0 && (
                    <div
                      className={`absolute top-full -left-2 z-50 mt-3.5 flex origin-top overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg transition-all duration-200 ${isOpen ? "pointer-events-auto scale-y-100 opacity-100" : "pointer-events-none scale-y-95 opacity-0"}`}
                    >
                      {/* 대분류 패널 */}
                      <ul className="w-40 border-r border-gray-100 py-1">
                        {item.children.map((parent) => (
                          <li
                            key={parent.label}
                            onMouseEnter={() => setActiveParent(parent.label)}
                          >
                            <Link
                              href={parent.href ?? "#"}
                              onClick={() => setOpenDropdown(null)}
                              className={`flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 ${
                                activeParent === parent.label
                                  ? "text-brand-blue bg-blue-50/60"
                                  : "text-gray-700"
                              }`}
                            >
                              {parent.label}
                              {parent.children &&
                                parent.children.length > 0 && (
                                  <ChevronDown
                                    className={`h-3.5 w-3.5 shrink-0 -rotate-90 ${activeParent === parent.label ? "text-brand-blue" : "text-gray-300"}`}
                                  />
                                )}
                            </Link>
                          </li>
                        ))}
                      </ul>

                      {/* 소분류 패널 */}
                      <ul
                        className={`w-36 py-1 transition-opacity duration-150 ${activeParent ? "opacity-100" : "opacity-0"}`}
                      >
                        {item.children
                          .find((p) => p.label === activeParent)
                          ?.children?.map((child) => (
                            <li key={child.label}>
                              <Link
                                href={child.href ?? "#"}
                                onClick={() => setOpenDropdown(null)}
                                className="block px-4 py-2.5 text-sm text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-800"
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex items-center gap-3">
          {/* 검색 */}
          <div className="flex items-center">
            {/* 모바일 전용 검색 버튼: 열리면 숨김 */}
            {!searchOpen && (
              <Tooltip label="검색" className="lg:hidden">
                <button
                  onClick={onClickSearchIcon}
                  className="hover:text-brand-blue flex items-center text-gray-600"
                >
                  <Search className="h-6 w-6" />
                </button>
              </Tooltip>
            )}

            {/* 인풋 컨테이너: 모바일은 state로 확장, PC는 항상 표시 */}
            <div
              className={`overflow-hidden transition-all duration-300 ${searchOpen ? "w-[calc(100vw-12rem)]" : "w-0"} lg:w-52`}
            >
              <div className="relative">
                <input
                  placeholder="검색어를 입력해주세요"
                  ref={inputRef}
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

          {loggedIn ? (
            <>
              {/* 장바구니 */}
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

              {/* 유저 드롭다운 */}
              <div ref={userMenuRef} className="relative flex items-center">
                <Tooltip label="내 계정">
                  <button
                    onClick={() => setOpenUserMenu((v) => !v)}
                    className="hover:text-brand-blue flex items-center text-gray-600"
                  >
                    <UserCircle className="h-6 w-6" />
                  </button>
                </Tooltip>
                {openUserMenu && (
                  <div className="absolute top-full right-0 z-50 mt-2 w-36 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                    {[
                      { label: "내 프로필", href: "/mypage" },
                      { label: "주문내역", href: "/mypage/orders" },
                      { label: "배송지 관리", href: "/mypage/addresses" },
                    ].map(({ label, href }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setOpenUserMenu(false)}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
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
