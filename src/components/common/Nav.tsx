"use client";

import { CartIcon, Logo, MenuIcon, SearchIcon } from "@/assets";
import Link from "next/link";

const Nav = () => {
  return (
    <nav className="sticky top-0 flex h-17.25 items-center justify-between bg-white p-5">
      <MenuIcon className="h-6 w-6" />
      <Link href="/" className="absolute left-1/2 -translate-x-1/2">
        <Logo className="w-[102px]" shapeRendering="crispEdges" />
      </Link>
      <div className="flex gap-3">
        <SearchIcon className="h-6 w-6" shapeRendering="geometricPrecision" />
        <CartIcon className="h-6 w-6" shapeRendering="geometricPrecision" />
      </div>
    </nav>
  );
};

export default Nav;
