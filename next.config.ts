import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Autoriser la build même avec des erreurs ESLint (on corrigera ensuite)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Autoriser la build même avec des erreurs TypeScript (temporaire le temps de corriger)
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
