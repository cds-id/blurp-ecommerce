import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Keep config deployable across machines/CI (no absolute paths).
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "placehold.co" },
    ],
  },
};

export default nextConfig;
