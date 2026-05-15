import commonjs from "@rollup/plugin-commonjs"
import json from "@rollup/plugin-json"
import execute from 'rollup-plugin-execute'
import nodeResolve from '@rollup/plugin-node-resolve'
import rename from './rollup.rename.js'

export default [
  {
    context: 'globalThis',
    input: "./js/ccxt.js",
    output: [
      {
        dir: "./dist/cjs/",
        format: "cjs",
        preserveModules: true,
        exports: "named",
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
      rename,
      execute("echo '{ \"type\": \"commonjs\" }' > ./dist/cjs/package.json"), // this is needed to make node treat files inside dist/cjs as CJS modules
      execute("echo 'import * as ccxt from \"./js/ccxt.js\";\\nexport = ccxt;' > ./index.d.cts") // CJS type declarations for node16/nodenext moduleResolution
    ],
    onwarn: ( warning, next ) => {
      if ( warning.message.indexOf('is implicitly using "default" export mode') > -1 ) return;
      next( warning );
    },
    external: [
      'socks-proxy-agent',
      // node resolve generate dist/cjs/js directory, treat ws, debug as external
      'ws',
      'debug',
      "http-proxy-agent",
      "https-proxy-agent",
      "protobufjs/minimal",
      "protobufjs/minimal.js"
    ]
  }
];