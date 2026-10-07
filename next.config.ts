import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite locates its wasm via import.meta.url; bundling it breaks that.
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
