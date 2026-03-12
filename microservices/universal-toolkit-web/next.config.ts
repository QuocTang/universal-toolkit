import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Next.js from bundling native Node.js CJS modules for API routes
  serverExternalPackages: ["latex-to-omml", "mathjax-node"],
};

export default nextConfig;
