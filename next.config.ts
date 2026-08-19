import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/products",
        destination: "/products/one-life",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;