import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Artists paste image URLs from any public host, so accept any HTTPS source.
    // For a tighter production policy, swap the ** wildcard for an explicit
    // allowlist of hosts you trust.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    formats: ["image/webp", "image/avif"],
  },
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
};

export default nextConfig;
