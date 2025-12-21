import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const configDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    // Prevent Next.js from inferring the wrong workspace root when multiple lockfiles exist.
    root: configDir,
  },
  experimental: {
    proxyClientMaxBodySize: '64gb',
  }
};

export default nextConfig;
