/*  ------------------------------------------------------------------------ */
import { isNode } from './platform.js';
/*  ------------------------------------------------------------------------ */
let fsSyncModule = null;
let osSyncModule = null;
let pathSyncModule = null;
let urlSyncModule = null;
/*  ------------------------------------------------------------------------ */
/**
 * Initialize synchronous file system module (Node.js only)
 * Uses dynamic import to prevent bundling in browser builds
 */
export async function initFileSystem() {
    if (isNode) {
        if (fsSyncModule === null) {
            try {
                // Dynamic import with rspackIgnore to prevent bundling
                fsSyncModule = await import(/* webpackIgnore: true */ 'node:fs');
            }
            catch (e) { } // Silent fail in browser or if fs is unavailable
        }
        if (osSyncModule === null) {
            try {
                osSyncModule = await import(/* webpackIgnore: true */ 'node:os');
            }
            catch (e) { } // Silent fail in browser or if os is unavailable
        }
        if (pathSyncModule === null) {
            try {
                pathSyncModule = await import(/* webpackIgnore: true */ 'node:path');
            }
            catch (e) { } // Silent fail in browser or if path is unavailable
        }
        if (urlSyncModule === null) {
            try {
                urlSyncModule = await import(/* webpackIgnore: true */ 'node:url');
            }
            catch (e) { } // Silent fail in browser or if url is unavailable
        }
    }
}
if (isNode) {
    // Pre-initialize synchronous fs module for sync methods
    initFileSystem();
}
/*  ------------------------------------------------------------------------ */
/**
 * Get system temporary directory (Node.js only)
 * @returns Temporary directory path with trailing slash, or undefined
 */
export function getTempDir() {
    if (!isNode || osSyncModule === null) {
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
    if (pathSyncModule === null) {
        throw new Error('path module is not available');
    }
    const sanitizedFilePath = pathSyncModule.resolve(filePath);
    if ((sanitizedFilePath.startsWith(filePath) && sanitizedFilePath.endsWith('.ccxtfile')) || sanitizedFilePath.endsWith('.wasm')) {
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
export function readFile(path, encoding = 'utf8') {
    if (!isNode || fsSyncModule === null) {
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
export function writeFile(path, data, encoding = 'utf8') {
    if (!isNode || fsSyncModule === null) {
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
export function existsFile(path) {
    if (!isNode || fsSyncModule === null) {
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
/*  ------------------------------------------------------------------------ */
/**
 * Convert file-path to file-url format on Windows, to avoid ESM loader error when using absolute paths, like:
 * Error [ERR_UNSUPPORTED_ESM_URL_SCHEME]: Only URLs with a scheme in: file, data, and node are supported by the default ESM loader. On Windows, absolute paths must be valid file:// URLs. Received protocol 'd:' at throwIfUnsupportedURLScheme (node:internal/modules/esm/load:195:11)
 * @param filePath File path to check
 * @returns filepath original or converted to file URL format on Windows
 */
export function filePathToFileUrlForWindows(filePath) {
    if (!isNode || !filePath || filePath.startsWith('file://') || osSyncModule === null || urlSyncModule === null) {
        return filePath;
    }
    if (osSyncModule.platform() !== 'win32') {
        return filePath;
    }
    const looksLikeWindowsPath = /^[a-zA-Z]:[\\/]/.test(filePath) || filePath.startsWith('\\\\');
    return looksLikeWindowsPath ? urlSyncModule.pathToFileURL(filePath).href : filePath;
}
