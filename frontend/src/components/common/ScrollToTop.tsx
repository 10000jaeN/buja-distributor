"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronUpIcon } from "lucide-react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const isProductPage = /^\/products\/[^/]+$/.test(pathname);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="맨 위로"
      className={`fixed right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md transition-opacity hover:opacity-80 ${
        isProductPage ? "bottom-29 lg:bottom-8" : "bottom-8"
      }`}
    >
      <ChevronUpIcon className="h-5 w-5 text-gray-600" />
    </button>
  );
}
