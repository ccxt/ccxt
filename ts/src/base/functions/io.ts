/*  ------------------------------------------------------------------------ */

import { isNode } from './platform.js';

/*  ------------------------------------------------------------------------ */

let fsSyncModule: any = null;

/*  ------------------------------------------------------------------------ */

/**
 * Initialize synchronous file system module (Node.js only)
 * Uses dynamic import to prevent bundling in browser builds
 */
export async function initFileSystem () {
    if (isNode && fsSyncModule === null) {
        try {
            // Dynamic import with webpackIgnore to prevent bundling
            fsSyncModule = await import(/* webpackIgnore: true */ 'node:fs');
        } catch (e) {
            // Silent fail in browser or if fs is unavailable
            fsSyncModule = null;
        }
    }
    return fsSyncModule;
}

if (isNode) {
    // Pre-initialize synchronous fs module for sync methods
    initFileSystem();
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
    try {
        return fsSyncModule.readFileSync(path, encoding);
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
    try {
        fsSyncModule.writeFileSync(path, data, encoding);
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
    try {
        fsSyncModule.accessSync(path);
        return true;
    } catch (e) {
        return false;
    }
}

// /*  ------------------------------------------------------------------------ */

// /**
//  * Delete file synchronously (Node.js only)
//  * @param path File path to delete
//  */
// export function fileDelete (path: string): void {
//     if (!isNode) {
//         return;
//     }
//     if (fsSyncModule === null) {
//         // Sync module not initialized yet
//         return;
//     }
//     try {
//         fsSyncModule.unlinkSync(path);
//     } catch (e) {
//         // Silent fail if file doesn't exist or can't be deleted
//     }
// }

// /*  ------------------------------------------------------------------------ */

// /**
//  * Check if directory exists synchronously (Node.js only)
//  * @param path Directory path to check
//  * @returns true if directory exists, false otherwise
//  */
// export function directoryExists (path: string): boolean {
//     if (!isNode) {
//         return false;
//     }
//     if (fsSyncModule === null) {
//         // Sync module not initialized yet
//         return false;
//     }
//     try {
//         return fsSyncModule.existsSync(path) && fsSyncModule.statSync(path).isDirectory();
//     } catch (e) {
//         return false;
//     }
// }

// /*  ------------------------------------------------------------------------ */

// /**
//  * Create directory synchronously (Node.js only)
//  * @param path Directory path to create
//  * @returns true if directory was created, false otherwise
//  */
// export function directoryCreate (path: string): boolean {
//     if (!isNode) {
//         return false;
//     }
//     if (fsSyncModule === null) {
//         // Sync module not initialized yet
//         return false;
//     }
//     try {
//         // recursive: true is like mkdir -p
//         fsSyncModule.mkdirSync(path, { recursive: true });
//         return true;
//     } catch (e) {
//         return false;
//     }
// }

// /*  ------------------------------------------------------------------------ */

// /**
//  * Delete directory synchronously (Node.js only)
//  * @param path Directory path to delete
//  * @returns true if directory was deleted, false otherwise
//  */
// export function directoryDelete (path: string): boolean {
//     if (!isNode) {
//         return false;
//     }
//     if (fsSyncModule === null) {
//         // Sync module not initialized yet
//         return false;
//     }
//     try {
//         // recursive: true force deletes (like rm -rf)
//         fsSyncModule.rmSync(path, { recursive: true, force: true });
//         return true;
//     } catch (e) {
//         return false;
//     }
// }
