import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";

export default {
  inlineDynamicImports: true,
  input: "./js/ccxt.js",
  output: [
    {
      file: "./dist/ccxt.bundle.cjs",
      format: "cjs",
    }
  ],
  plugins: [
    json(),
    commonjs({
      transformMixedEsModules: true,
      dynamicRequireTargets: ["**/js/src/static_dependencies/**/*.cjs"],
      
    }),
  ]
};