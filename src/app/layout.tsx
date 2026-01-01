import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Nav from "@/components/common/Nav";
import Footer from "@/components/common/Footer";

const pretendard = localFont({
  src: "../public/fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920", // 가변 폰트의 범위를 지정합니다.
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  title: "부자유통",
  description: "유통을 내 손 안에",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <Nav />

        <main className="flex-1">{children}</main>

        <Footer />
      </body>
    </html>
  );
}
