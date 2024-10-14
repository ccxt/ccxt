import { resolve } from "path";
import { defineConfig } from "vite";
// import nodeResolve from "@rollup/plugin-node-resolve";

import packageJson from "./package.json";

/** Ensure same logic can run, even if a root package
 * (that has no dependencies or peerDependencies) */
const { name, dependencies, peerDependencies } =
  packageJson as typeof packageJson & {
    dependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
  };

/** Treat anything in same scope as being
 * explicit external dep (don't bundle) */
const external = Object.keys({
  ...dependencies,
  ...peerDependencies,
});

export default defineConfig({
  build: {
    target: "node10",
    outDir: "./dist",
    emptyOutDir: false,
    lib: {
      name,
      entry: resolve(__dirname, "src/index.ts"),
      fileName: "index",
      formats: ["cjs", "es"],
    },
    rollupOptions: {
      // plugins: [nodeResolve()],
      external,
    },
    // sourcemap: true,
  },
});
