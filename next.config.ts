import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ibb.co",
        port: "",
        pathname: "/**", // 모든 경로의 이미지를 허용
      },
    ],
  },

  reactCompiler: true,
};

export default nextConfig;
