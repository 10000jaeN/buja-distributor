import type { NextConfig } from "next";

// 외부 스크립트를 허용하는 도메인 화이트리스트
// 새 외부 스크립트 추가 시 여기에만 추가하면 됩니다
const ALLOWED_SCRIPT_ORIGINS = [
  "https://js.tosspayments.com",
].join(" ");

const ALLOWED_FRAME_ORIGINS = [
  "https://js.tosspayments.com",
  "https://payment.tosspayments.com",
].join(" ");

const isDev = process.env.NODE_ENV !== "production";

// Next.js App Router는 inline script가 필요하므로 unsafe-inline 허용
// 완전한 nonce 기반 CSP가 필요하다면 Next.js middleware에서 별도 구현 필요
const ContentSecurityPolicy = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${ALLOWED_SCRIPT_ORIGINS}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: https:`,
  `font-src 'self' data:`,
  // 개발 환경에서는 http://localhost:* 허용 (백엔드가 HTTP로 실행됨)
  isDev
    ? `connect-src 'self' http://localhost:* https: wss: ws:`
    : `connect-src 'self' https: wss:`,
  `frame-src ${ALLOWED_FRAME_ORIGINS}`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
].join("; ");

const securityHeaders = [
  // XSS, 인젝션 방어
  { key: "Content-Security-Policy", value: ContentSecurityPolicy },
  // 클릭재킹 방어 (iframe 삽입 차단)
  { key: "X-Frame-Options", value: "DENY" },
  // MIME 스니핑 방어
  { key: "X-Content-Type-Options", value: "nosniff" },
  // 레퍼러 정보 최소화
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // 불필요한 브라우저 API 비활성화
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(self)",
  },
];

const nextConfig: NextConfig = {
  output: "standalone",

  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ibb.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "fastly.picsum.photos",
        port: "",
        pathname: "/**",
      },
    ],
  },

  experimental: {
    reactCompiler: true,
  },
};

export default nextConfig;
