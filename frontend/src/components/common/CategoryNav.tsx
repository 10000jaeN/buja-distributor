"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { MenuItem } from "@/types/menu";

export default function CategoryNav({ menu }: { menu: MenuItem[] }) {
  const [dropdown, setDropdown] = useState<{
    label: string;
    active: string | null;
  } | null>(null);

  const navRef = useRef<HTMLUListElement>(null);

  const closeDropdown = () => setDropdown(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node))
        closeDropdown();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <ul ref={navRef} className="hidden items-center gap-5 lg:flex">
      {menu.map((item) => {
        const isOpen = dropdown?.label === item.label;
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
                onClick={() =>
                  setDropdown(
                    isOpen ? null : { label: item.label, active: null },
                  )
                }
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
                {/* 대분류 */}
                <ul className="w-40 border-r border-gray-100 py-1">
                  {item.children.map((parent) => (
                    <li
                      key={parent.label}
                      onMouseEnter={() =>
                        setDropdown({ label: item.label, active: parent.label })
                      }
                    >
                      <Link
                        href={parent.href ?? "#"}
                        onClick={closeDropdown}
                        className={`flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 ${dropdown?.active === parent.label ? "text-brand-blue bg-blue-50/60" : "text-gray-700"}`}
                      >
                        {parent.label}
                        {parent.children && parent.children.length > 0 && (
                          <ChevronDown
                            className={`h-3.5 w-3.5 shrink-0 -rotate-90 ${dropdown?.active === parent.label ? "text-brand-blue" : "text-gray-300"}`}
                          />
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* 소분류 */}
                <ul
                  className={`w-36 py-1 transition-opacity duration-150 ${dropdown?.active ? "opacity-100" : "opacity-0"}`}
                >
                  {item.children
                    .find((p) => p.label === dropdown?.active)
                    ?.children?.map((child) => (
                      <li key={child.label}>
                        <Link
                          href={child.href ?? "#"}
                          onClick={closeDropdown}
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
  );
}
