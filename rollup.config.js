import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import execute from 'rollup-plugin-execute';
import nodeResolve from '@rollup/plugin-node-resolve'

export default [
  {
    preserveModules: true,
    context: 'globalThis',
    input: "./js/ccxt.js",
    output: [
      {
        dir: "./dist/cjs/",
        format: "cjs",
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
      execute("echo '{ \"type\": \"commonjs\" }' > ./dist/cjs/package.json"), // this is needed to make node treat files inside dist/cjs as CJS modules
      execute("echo 'import * as ccxt from \"./js/ccxt.js\";\\nexport = ccxt;' > ./index.d.cts") // CJS type declarations for node16/nodenext moduleResolution
    ],
    onwarn: ( warning, next ) => {
      if ( warning.message.indexOf('is implicitly using "default" export mode') > -1 ) return;
      next( warning );
    },
    // `external` matches exact specifiers only, so imports like
    // `@noble/curves/ed25519.js` or `protobufjs/minimal.js` would slip through.
    // Use a function that matches by package prefix instead.
    external: (id) => {
      const externals = [
        // runtime dependencies from package.json (keep them external so they aren't bundled)
        '@noble/curves',
        '@noble/hashes',
        '@scure/base',
        '@scure/bip32',
        '@scure/bip39',
        '@scure/starknet',
        'ws',
        'bufferutil',
        // optional proxy agents (dynamically imported)
        'socks-proxy-agent',
        'http-proxy-agent',
        'https-proxy-agent',
        // protobuf is used by the dydx-v4 static dependency
        'protobufjs',
        // transitive dependency of ws
        'debug',
      ];
      return externals.some((pkg) => id === pkg || id.startsWith(pkg + '/'));
    }
  }
];