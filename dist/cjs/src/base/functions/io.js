'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var platform = require('./platform.js');

function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n["default"] = e;
    return Object.freeze(n);
}

// ----------------------------------------------------------------------------
/*  ------------------------------------------------------------------------ */
let fsSyncModule = null;
let osSyncModule = null;
let pathSyncModule = null;
/*  ------------------------------------------------------------------------ */
/**
 * Initialize synchronous file system module (Node.js only)
 * Uses dynamic import to prevent bundling in browser builds
 */
async function initFileSystem() {
    if (platform.isNode) {
        if (fsSyncModule === null) {
            try {
                // Dynamic import with webpackIgnore to prevent bundling
                fsSyncModule = await Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require(/* webpackIgnore: true */ 'node:fs')); });
            }
            catch (e) { } // Silent fail in browser or if fs is unavailable
        }
        if (osSyncModule === null) {
            try {
                osSyncModule = await Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require(/* webpackIgnore: true */ 'node:os')); });
            }
            catch (e) { } // Silent fail in browser or if os is unavailable
        }
        if (pathSyncModule === null) {
            try {
                pathSyncModule = await Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require(/* webpackIgnore: true */ 'node:path')); });
            }
            catch (e) { } // Silent fail in browser or if path is unavailable
        }
    }
}
if (platform.isNode) {
    // Pre-initialize synchronous fs module for sync methods
    initFileSystem();
}
/*  ------------------------------------------------------------------------ */
/**
 * Get system temporary directory (Node.js only)
 * @returns Temporary directory path with trailing slash, or undefined
 */
function getTempDir() {
    if (!platform.isNode || osSyncModule === null) {
        return undefined;
    }
    try {
        const tmpDir = pathSyncModule.resolve(osSyncModule.tmpdir());
        const sep = pathSyncModule ? pathSyncModule.sep : '/';
        return tmpDir.endsWith(sep) ? tmpDir : tmpDir + sep;
    }
    catch (e) {
        return undefined;
    }
}
/**
 * Check if file path is ccxt-cache file, so users are ensured there is no access possible to other files
 * @param path File path to check
 */
function ensureWhitelistedFile(filePath) {
    const tempDir = getTempDir();
    if (!tempDir) {
        throw new Error('invalid file path: ' + filePath);
    }
    const sanitizedFilePath = pathSyncModule.resolve(filePath);
    if ((sanitizedFilePath.startsWith(tempDir) && sanitizedFilePath.endsWith('.ccxtfile')) || sanitizedFilePath.endsWith('.wasm')) {
        return;
    }
    throw new Error('invalid file path: ' + filePath);
}
/*  ------------------------------------------------------------------------ */
/**
 * Read file contents synchronously (Node.js only)
 * @param path File path to read
 * @param encoding File encoding (default: 'utf8')
 * @returns File contents as string, or undefined in browser
 */
function readFile(path, encoding = 'utf8') {
    if (!platform.isNode || fsSyncModule === null) {
        // Sync module not initialized yet
        return undefined;
    }
    ensureWhitelistedFile(path);
    try {
        return fsSyncModule.readFileSync(path, encoding);
    }
    catch (e) {
        return undefined;
    }
}
/*  ------------------------------------------------------------------------ */
/**
 * Write file contents synchronously (Node.js only)
 * @param path File path to write
 * @param data Data to write
 * @param encoding File encoding (default: 'utf8')
 */
function writeFile(path, data, encoding = 'utf8') {
    if (!platform.isNode || fsSyncModule === null) {
        return false;
    }
    ensureWhitelistedFile(path);
    try {
        fsSyncModule.writeFileSync(path, data, encoding);
        return true;
    }
    catch (e) {
        // Silent fail
        return false;
    }
}
/*  ------------------------------------------------------------------------ */
/**
 * Check if file exists synchronously (Node.js only)
 * @param path File path to check
 * @returns true if file exists, false otherwise
 */
function existsFile(path) {
    if (!platform.isNode || fsSyncModule === null) {
        // Sync module not initialized yet
        return false;
    }
    ensureWhitelistedFile(path);
    try {
        fsSyncModule.accessSync(path);
        return true;
    }
    catch (e) {
        return false;
    }
}

exports.existsFile = existsFile;
exports.getTempDir = getTempDir;
exports.initFileSystem = initFileSystem;
exports.readFile = readFile;
exports.writeFile = writeFile;
