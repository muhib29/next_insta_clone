import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["gateway.pinata.cloud", "upload.wikimedia.org", "img.icons8.com"], // Add the domains here
  },
};

export default nextConfig;
