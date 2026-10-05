import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;

// Exposes local D1/R2 bindings (Miniflare) to `next dev` via getCloudflareContext().
initOpenNextCloudflareForDev();
