import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "검색",
  description: "원하는 상품을 검색해보세요.",
  robots: { index: false, follow: false },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
