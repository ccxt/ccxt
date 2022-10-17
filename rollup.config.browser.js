import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import nodePolyfills from 'rollup-plugin-polyfill-node';

export default {
  inlineDynamicImports: true,
  input: "./js/ccxt.js",
  output: [
    {
      file: "./dist/ccxt.browser.mjs",
      format: "es",
      footer: "window.ccxt = ccxt;"
    }
  ],
  plugins: [
    json(),
    commonjs({
      transformMixedEsModules: true,
      dynamicRequireTargets: ["**/js/src/static_dependencies/**/*.cjs"],
      
    }),
    nodePolyfills({ buffer: false }),
    resolve({ preferBuiltins:false }),
  ]
};