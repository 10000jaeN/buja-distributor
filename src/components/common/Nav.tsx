"use client";

import { Logo, MenuIcon } from "@/assets";
import useAuthStore from "@/store/useAuthStore";
import useMenuStore from "@/store/useMenuStore";
import { MenuItem } from "@/types/menu";
import { Search, ShoppingCart, UserCircle } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

const Nav = ({ menu }: { menu: MenuItem[] }) => {
  const [openSearchBar, setOpenSearchBar] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const openMenu = useMenuStore((state) => state.openMenu);
  const loggedIn = useAuthStore((state) => state.isLoggedIn);

  const onClickSearchBar = () => {
    setOpenSearchBar(!openSearchBar);
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-300 bg-white">
      {/* 상단 바 */}
      <div className="mx-auto flex h-17.25 w-full max-w-[1024px] items-center justify-between p-5">
        {/* 왼쪽: 햄버거(모바일) + 로고 + 카테고리(PC) */}
        <div className="flex items-center gap-6">
          <MenuIcon
            className="h-6 w-6 hover:cursor-pointer lg:hidden"
            onClick={openMenu}
          />
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0">
            <Logo className="w-[102px]" shapeRendering="crispEdges" />
          </Link>

          {/* PC 메뉴 */}
          <ul className="hidden items-center gap-5 lg:flex">
            {menu.map((item) => (
              <li key={item.label} className="group relative">
                {item.href ? (
                  <Link href={item.href} className="text-sm font-semibold hover:text-gray-500">
                    {item.label}
                  </Link>
                ) : (
                  <span className="cursor-default text-sm font-semibold">{item.label}</span>
                )}
                {item.children && item.children.length > 0 && (
                  <ul className="absolute top-full left-1/2 z-50 hidden min-w-[120px] -translate-x-1/2 rounded-lg border border-gray-200 bg-white py-2 shadow-lg group-hover:block">
                    {item.children.map((child) => (
                      <li key={child.label}>
                        <Link
                          href={child.href ?? "#"}
                          className="block px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              placeholder="검색어를 입력해주세요"
              ref={inputRef}
              className={`${openSearchBar ? `${loggedIn ? "w-[70vw]" : "w-[60vw]"} px-2.5 pl-10 opacity-100` : "w-7 px-0 opacity-0"} h-9 rounded-full bg-gray-200 transition-normal duration-300`}
            />
            <Search
              className="absolute top-1/2 left-2 h-5 w-5 -translate-y-1/2 cursor-pointer text-gray-600 hover:text-brand-blue"
              onClick={onClickSearchBar}
            />
          </div>

          {loggedIn ? (
            <>
              <Link href="/mypage" className="text-gray-600 hover:text-brand-blue">
                <UserCircle className="h-6 w-6" />
              </Link>
              <Link href="/cart" className="text-gray-600 hover:text-brand-blue">
                <ShoppingCart className="h-6 w-6" />
              </Link>
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
