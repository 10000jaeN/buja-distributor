import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "전체 상품",
  description: "부자유통의 다양한 상품을 카테고리별로 둘러보세요.",
  openGraph: {
    title: "전체 상품 | 부자유통",
    description: "부자유통의 다양한 상품을 카테고리별로 둘러보세요.",
  },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
