import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import execute from 'rollup-plugin-execute';
import nodeResolve from '@rollup/plugin-node-resolve'

export default [
  {
    preserveModules: true,
    input: "./js/ccxt.js",
    output: [
      {
        dir: "./dist/cjs/",
        format: "cjs",
      }
    ],
    plugins: [
      nodeResolve({
        preferBuiltins: true,
        // node resolve generate dist/cjs/js directory 
        jail: '/src'
      }),
      json(),
      commonjs({
        transformMixedEsModules: true,
        dynamicRequireTargets: ["**/js/src/static_dependencies/**/*.cjs"],
      }),
      execute("echo '{ \"type\": \"commonjs\" }' > ./dist/cjs/package.json") // this is needed to make node treat files inside dist/cjs as CJS modules
    ],
    onwarn: ( warning, next ) => {
      if ( warning.message.indexOf('is implicitly using "default" export mode') > -1 ) return;
      next( warning );
    },
    external: [
      'socks-proxy-agent',
      // node resolve generate dist/cjs/js directory, treat ws, debug as external
      'ws', 'debug'
    ]
  },
  {
    inlineDynamicImports: true,
    input: "./js/ccxt.js",
    output: [
      {
        file: "./dist/ccxt.bundle.cjs",
        format: "cjs",
      },
    ],
    plugins: [
      nodeResolve({ preferBuiltins: true }),
      json(),
      commonjs({
        transformMixedEsModules: true,
        dynamicRequireTargets: ["**/js/src/static_dependencies/**/*.cjs"],
      }),
    ],
    external: [
      'socks-proxy-agent'
    ]
  }
];