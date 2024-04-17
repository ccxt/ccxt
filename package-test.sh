#!/bin/bash

# Asserts the npm package works as expected, using ESM and CJS.
npm pack .
mv ccxt-*.tgz package-test/
cd package-test
npm install ccxt-*.tgz
node test-esm.mjs
return_code=$?
node test-cjs.cjs
cjs_return_code=$?
rm -rf node_modules ccxt-*.tgz package-lock.json package.json
npm init -y > /dev/null
if [ $return_code -eq 0 ] && [ $cjs_return_code -eq 0 ]; then
  echo "Package test successful"
  exit 0
else
  echo "Package test failed"
  exit 1
fi