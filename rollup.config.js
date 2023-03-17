import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import execute from 'rollup-plugin-execute';

export default {
  inlineDynamicImports: true,
  input: "./js/ccxt.js",
  output: [
    {
      dir: "./dist/cjs/",
      format: "cjs",
    }
  ],
  plugins: [
    json(),
    commonjs({
      transformMixedEsModules: true,
      dynamicRequireTargets: ["**/js/src/static_dependencies/**/*.cjs"],
    }),
    execute("echo '{ \"type\": \"commonjs\" }' > ./dist/cjs/package.json")
  ]
};