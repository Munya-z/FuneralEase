import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@funeralease/ui"],
  async rewrites() {
    return [
      {
        source: "/api-proxy/:path*",
        destination: "http://localhost:5001/:path*",
      },
    ];
  },
};

export default nextConfig;
