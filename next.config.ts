import type { NextConfig } from "next";

// Optional subpath when hosting under e.g. https://username.github.io/<repo>.
// Set the env var in CI (the deploy workflow does this for GitHub Pages
// project sites). Leave empty for a custom domain or root deploy.
const basePath = process.env.NEXT_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // Pure static output. `pnpm build` writes everything to ./out/ which can be
  // served by any static host (S3 / Nginx / GitHub Pages / Cloudflare Pages /
  // a folder on a USB stick). No Node runtime is required at serve time.
  output: "export",

  // Static export cannot run the default <Image /> optimizer.
  images: { unoptimized: true },

  // GitHub Pages / Nginx are happiest with directory-style URLs (so each page
  // is a folder containing index.html). Comment out for hosts that prefer
  // /docs.html style.
  trailingSlash: true,

  ...(basePath ? { basePath, assetPrefix: basePath } : {}),

  // Mirror the basePath into a public env var so client-side code can build
  // absolute URLs (e.g. the install snippet that quotes the .zip download URL).
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },

  // The Windsurf browser preview proxies through 127.0.0.1; allow it so that
  // dev-mode HMR works inside the embedded preview iframe.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
