import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  basePath: basePath || undefined,
  output: process.env.NODE_ENV === "production" && process.env.GITHUB_ACTIONS ? "export" : undefined,
  trailingSlash: true,
  // Note: headers() is not supported in static export
  // For GitHub Pages, headers need to be set via _headers file or meta tags
  ...(process.env.NODE_ENV !== "production" || !process.env.GITHUB_ACTIONS
    ? {
        headers() {
          // Required by FHEVM (only in development)
          return Promise.resolve([
            {
              source: "/:path*",
              headers: [
                { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
                { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
              ],
            },
            {
              source: "/:path*.wasm",
              headers: [
                { key: "Content-Type", value: "application/wasm" },
                { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
              ],
            },
          ]);
        },
      }
    : {}),
};

export default nextConfig;
