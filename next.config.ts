import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: __dirname,
  },
  allowedDevOrigins: ['192.168.100.215'],
};

export default nextConfig;
