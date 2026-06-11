import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));

// Serve under a sub-path when deployed behind a reverse proxy (e.g. /playground
// at docs.ccxt.com). Baked in at build time; empty = served at root locally.
const basePath = process.env.NEXT_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ccxt is a large server-side dependency; keep it external to the bundle so
  // the run API spawns it from node_modules rather than rspack inlining it.
  serverExternalPackages: ["ccxt"],
  // The playground sits inside the CCXT monorepo (which has its own lockfile);
  // pin the tracing root here so Next doesn't infer the monorepo as the root.
  outputFileTracingRoot: here,
  ...(basePath ? { basePath } : {}),
  // Exposed to the client so fetch() calls can prefix the base path (Next only
  // auto-prefixes <Link>/navigation, not fetch).
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
