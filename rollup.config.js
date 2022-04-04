import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";

const extensions = [".js", ".ts", ".cjs", ".mjs"];

export default {
  inlineDynamicImports: true,
  input: "ccxt.js",
  output: [
    {
      file: "./dist/ccxt.browser.js",
      format: "es",
    }
  ],
  plugins: [
    json(),
    resolve({ browser: true, extensions: extensions, preferBuiltins:false }),
    commonjs({
      transformMixedEsModules: true,
      dynamicRequireTargets: ["**/js/static_dependencies/**/*.cjs"]
    }),
  ]
};