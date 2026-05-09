import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Keep config deployable across machines/CI (no absolute paths).
  turbopack: {
    root: path.join(__dirname),
  },
  async redirects() {
    return [
      // Backend guest tracking emails link to /track?token=... — keep that path
      // working by redirecting into the existing tracker page.
      { source: "/track", destination: "/store/tracker", permanent: false },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "placehold.co" },
      // Common object-storage / image CDN hosts for catalog `primary_image_url` / `cdn_url`
      { protocol: "https", hostname: "*.r2.dev" },
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "imagedelivery.net" },
      { protocol: "https", hostname: "*.amazonaws.com" },
    ],
  },
};

export default nextConfig;
