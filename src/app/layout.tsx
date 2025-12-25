import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const pretendard = localFont({
  src: './fonts/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920', // 가변 폰트의 범위를 지정합니다.
  variable: '--font-pretendard',
});

export const metadata: Metadata = {
  title: '부자유통',
  description: '유통을 내 손 안에',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
