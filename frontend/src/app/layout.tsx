import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const pretendard = localFont({
  src: "../public/fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "부자유통",
    template: "%s | 부자유통",
  },
  description: "유통을 내 손 안에 — 다양한 상품을 합리적인 가격에 만나보세요.",
  keywords: ["부자유통", "온라인쇼핑", "도매", "유통", "쇼핑몰"],
  openGraph: {
    title: "부자유통",
    description: "유통을 내 손 안에 — 다양한 상품을 합리적인 가격에 만나보세요.",
    siteName: "부자유통",
    locale: "ko_KR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={cn("font-sans", geist.variable, pretendard.variable)}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
