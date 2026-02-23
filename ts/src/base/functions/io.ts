/*  ------------------------------------------------------------------------ */

import { isNode } from './platform.js';

/*  ------------------------------------------------------------------------ */

let fsSyncModule: any = null;
let osSyncModule: any = null;
let pathSyncModule: any = null;

/*  ------------------------------------------------------------------------ */

/**
 * Initialize synchronous file system module (Node.js only)
 * Uses dynamic import to prevent bundling in browser builds
 */
export async function initFileSystem () {
    if (isNode) {
        if (fsSyncModule === null) {
            try {
                // Dynamic import with webpackIgnore to prevent bundling
                fsSyncModule = await import (/* webpackIgnore: true */ 'node:fs');
            } catch (e) {
                // Silent fail in browser or if fs is unavailable
                fsSyncModule = null;
            }
        }
        if (osSyncModule === null) {
            try {
                osSyncModule = await import (/* webpackIgnore: true */ 'node:os');
            } catch (e) {
                osSyncModule = null;
            }
        }
        if (pathSyncModule === null) {
            try {
                pathSyncModule = await import(/* webpackIgnore: true */ 'node:path');
            } catch (e) {
                pathSyncModule = null;
            }
        }
    }
    return {
        fs: fsSyncModule,
        os: osSyncModule,
        path: pathSyncModule,
    };
}

if (isNode) {
    // Pre-initialize synchronous fs module for sync methods
    initFileSystem ();
}

/*  ------------------------------------------------------------------------ */

/**
 * Get system temporary directory (Node.js only)
 * @returns Temporary directory path with trailing slash, or undefined
 */
export function getTempDir (): string | undefined {
    if (!isNode) {
        return undefined;
    }
    if (osSyncModule === null) {
        return undefined;
    }
    try {
        const tmpDir = osSyncModule.tmpdir ();
        const sep = pathSyncModule ? pathSyncModule.sep : '/';
        return tmpDir.endsWith(sep) ? tmpDir : tmpDir + sep;
    } catch (e) {
        return undefined;
    }
}

/**
 * Check if file path is ccxt-cache file, so users are ensured there is no access possible to other files
 * @param path File path to check
 */
function ensureCcxtFile (path: string) {
    if (!path.includes (getTempDir ()) || !path.includes ('ccxt')) {
        throw new Error('invalid file path');
    }
}

/*  ------------------------------------------------------------------------ */

/**
 * Read file contents synchronously (Node.js only)
 * @param path File path to read
 * @param encoding File encoding (default: 'utf8')
 * @returns File contents as string, or undefined in browser
 */
export function fileRead (path: string, encoding: BufferEncoding = 'utf8'): string | undefined {
    if (!isNode) {
        return undefined;
    }
    if (fsSyncModule === null) {
        // Sync module not initialized yet
        return undefined;
    }
    ensureCcxtFile (path);
    try {
        return fsSyncModule.readFileSync (path, encoding);
    } catch (e) {
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
export function fileWrite (path: string, data: string, encoding: BufferEncoding = 'utf8'): boolean {
    if (!isNode) {
        return !isNode; // return true in non-Node environments to indicate success (no-op)
    }
    if (fsSyncModule === null) {
        // Sync module not initialized yet
        return false;
    }
    ensureCcxtFile (path);
    try {
        fsSyncModule.writeFileSync (path, data, encoding);
        return true;
    } catch (e) {
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
export function fileExists (path: string): boolean {
    if (!isNode) {
        return false;
    }
    if (fsSyncModule === null) {
        // Sync module not initialized yet
        return false;
    }
    ensureCcxtFile (path);
    try {
        fsSyncModule.accessSync (path);
        return true;
    } catch (e) {
        return false;
    }
}


// we don't have `fileDelete` or other deletion methods, to ensure nothing is deleted by mistake