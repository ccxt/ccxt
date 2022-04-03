import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";

const extensions = [".js", ".ts", ".cjs", ".mjs"];

export default {
  inlineDynamicImports: true,
  input: "ccxt.js",
  output: [
    {
      file: "finalCCXT2.js",
      format: "es",
    }
  ],
  plugins: [
    json(),
    resolve({ browser: true, extensions: extensions }),
    commonjs({
      include: ["**/static_dependencies/**/*", "**/static_dependencies/**/*.*", "**/js/static_dependencies/**/*.*",  "**/js/static_dependencies/fetch-ponyfill/fetch-node.cjs"],
      transformMixedEsModules: true,
      dynamicRequireTargets: ["**/js/static_dependencies/**/*.*", "**/js/static_dependencies/fetch-ponyfill/fetch-node.cjs"]
    }),
  ]
};