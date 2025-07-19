import commonjs from "@rollup/plugin-commonjs"
import json from "@rollup/plugin-json"
import nodeResolve from '@rollup/plugin-node-resolve'
import alias from '@rollup/plugin-alias'
import inject from '@rollup/plugin-inject'
import terser from '@rollup/plugin-terser'

const basePlugins = [
  alias({
    entries: [
      { find: 'node:http', replacement: 'stream-http' },
      { find: 'node:https', replacement: 'https-browserify' },
      { find: 'node:buffer', replacement: 'buffer' },
      { find: 'node:util', replacement: 'util' },
      { find: 'node:url', replacement: 'url' },
      { find: 'node:zlib', replacement: 'browserify-zlib' },
      { find: 'node:stream', replacement: 'stream-browserify' },
      { find: 'node:process', replacement: 'process/browser' },
      { find: 'http', replacement: 'stream-http' },
      { find: 'https', replacement: 'https-browserify' },
      { find: 'zlib', replacement: 'browserify-zlib' },
      { find: 'stream', replacement: 'stream-browserify' },
      { find: 'process', replacement: 'process/browser' }
    ]
  }),
  nodeResolve({
    preferBuiltins: false,
    browser: true
  }),
  commonjs({}),
  inject({
    process: 'process'
  }),
  json(),
]

const onwarn = ( warning, next ) => {
  if ( warning.message.indexOf('Circular dependency: node_modules/') > -1 ) return
  if ( warning.message.indexOf('output.globals') > -1 ) return
  if ( warning.message.indexOf('Creating a browser bundle that depends on Node.js built-in modules') > -1 ) return
  next( warning )
}

const external = [
  'http-proxy-agent',
  'socks-proxy-agent',
  'node:net',
  'net',
  'tls'
]

export default [
  {
    input: "./js/ccxt.js",
    output: [
      {
        file: "./dist/ccxt.browser.js",
        format: "umd",
        name: 'ccxt',
        inlineDynamicImports: true,
        exports: 'named'
      }
    ],
    plugins: basePlugins,
    onwarn: onwarn,
    external: external
  },
  {
    input: "./js/ccxt.js",
    output: [
      {
        file: "./dist/ccxt.browser.min.js",
        format: "umd",
        name: 'ccxt',
        inlineDynamicImports: true,
        exports: 'named'
      }
    ],
    plugins: basePlugins.concat ([ terser() ]),
    onwarn: onwarn,
    external: external
  }
]