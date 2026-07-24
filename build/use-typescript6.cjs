// Redirects require('typescript') to the "typescript6" npm alias (typescript@6).
//
// typescript@7 (the root "typescript" dependency) is the native compiler: it only
// ships the `tsc` binary and a version stub as its JS entry point, so tools that
// need the classic JS compiler API (@typescript-eslint, ts-api-utils, ...) would
// crash when they require('typescript'). typescript@6 is the last release that
// ships the JS compiler API, installed here under the "typescript6" alias.
//
// Usage: node -r ./build/use-typescript6.cjs node_modules/eslint/bin/eslint.js ...
const Module = require ('module');

const originalResolve = Module._resolveFilename;

Module._resolveFilename = function (request, ...args) {
    if (request === 'typescript' || request.startsWith ('typescript/')) {
        request = 'typescript6' + request.slice ('typescript'.length);
    }
    return originalResolve.call (this, request, ...args);
};
