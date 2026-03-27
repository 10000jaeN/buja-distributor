import type { Metadata } from "next";
import MypageShell from "./MypageShell";

export const metadata: Metadata = {
  title: "마이페이지",
  description: "내 프로필, 주문내역, 배송지를 관리하세요.",
  robots: { index: false, follow: false },
};

export default function MypageLayout({ children }: { children: React.ReactNode }) {
  return <MypageShell>{children}</MypageShell>;
}
