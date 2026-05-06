import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: __dirname,
  },
  allowedDevOrigins: ['192.168.100.215', '192.168.100.226'],
};

export default nextConfig;
