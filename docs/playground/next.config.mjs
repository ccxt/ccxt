import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));

// Serve under a sub-path when deployed behind a reverse proxy (e.g. /playground
// at docs.ccxt.com). Baked in at build time; empty = served at root locally.
const basePath = process.env.NEXT_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // The monorepo root's ESLint flat config globally ignores this app's dir. At the
  // old top-level `playground/` path `next lint` saw it as ignored and skipped it;
  // from `docs/playground/` it instead applies the ancestor config to our .ts with a
  // non-TS parser and fails the build. Skip ESLint at build (tsc type-checking still
  // runs); the isolated Docker/CI build has no ancestor config and never linted here.
  eslint: { ignoreDuringBuilds: true },
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
