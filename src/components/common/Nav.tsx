"use client";

import { CartIcon, Logo, MenuIcon, SearchIcon } from "@/assets";
import useAuthStore from "@/store/useAuthStore";
import useMenuStore from "@/store/useMenuStore";
import Link from "next/link";
import { useRef, useState } from "react";

const Nav = () => {
  const [openSearchBar, setOpenSearchBar] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const openMenu = useMenuStore((state) => state.openMenu);
  const loggedIn = useAuthStore((state) => state.isLoggedIn);

  const onClickSearchBar = () => {
    setOpenSearchBar(!openSearchBar);
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  return (
    <nav className="sticky top-0 z-50 flex h-17.25 w-full items-center justify-between border-b border-gray-300 bg-white p-5">
      <MenuIcon className="h-6 w-6 hover:cursor-pointer" onClick={openMenu} />
      <Link href="/" className="absolute left-1/2 -translate-x-1/2">
        <Logo className="w-[102px]" shapeRendering="crispEdges" />
      </Link>
      <div className="flex items-center gap-4">
        <div className="relative">
          <input
            placeholder="검색어를 입력해주세요"
            ref={inputRef}
            className={`${openSearchBar ? `${loggedIn ? "w-[70vw]" : "w-[60vw]"} px-2.5 pl-10 opacity-100` : "w-7 px-0 opacity-0"} h-9 rounded-full bg-gray-200 transition-normal duration-300`}
          />
          <SearchIcon
            className="absolute top-1/2 left-2 h-6 w-6 -translate-y-1/2 hover:cursor-pointer"
            onClick={onClickSearchBar}
          />
        </div>

        {loggedIn ? (
          <CartIcon className="h-6 w-6" shapeRendering="geometricPrecision" />
        ) : (
          <Link
            href="/login"
            className="text-[14px] font-bold underline-offset-3 hover:cursor-pointer hover:underline"
          >
            로그인
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Nav;
