import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "192.168.1.3:3000"],
    },
  },
  allowedDevOrigins: ["localhost:3000", "192.168.1.3:3000"],
};

export default nextConfig;
