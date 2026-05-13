#!/bin/bash

# Asserts the npm package works as expected, using ESM, CJS, and exports map validation.
npm pack . --silent
mv ccxt-*.tgz ./utils/package-test/
cd ./utils/package-test
npm install ccxt-*.tgz typescript
node test-esm.mjs
return_code=$?
node test-cjs.cjs
cjs_return_code=$?
node test-exports.mjs
exports_return_code=$?
npx tsc --project tsconfig.json --noEmit
node16_types_return_code=$?
npx tsc --project tsconfig-bundler.json --noEmit
bundler_types_return_code=$?
rm -rf node_modules ccxt-*.tgz package-lock.json package.json
npm init -y > /dev/null
if [ $return_code -eq 0 ] && [ $cjs_return_code -eq 0 ] && [ $exports_return_code -eq 0 ] && [ $node16_types_return_code -eq 0 ] && [ $bundler_types_return_code -eq 0 ]; then
  echo "Package test successful"
  exit 0
else
  echo "Package test failed"
  exit 1
fi