import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Ensure we don't try to optimize fonts requiring server
  // optimizeFonts: false, // Usually fine in export
};

export default nextConfig;
