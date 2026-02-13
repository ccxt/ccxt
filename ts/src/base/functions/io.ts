/*  ------------------------------------------------------------------------ */

import { isNode } from './platform.js';

/*  ------------------------------------------------------------------------ */

let fsModule: any = null;
let fsSyncModule: any = null;

/*  ------------------------------------------------------------------------ */

/**
 * Initialize file system module (Node.js only)
 * Uses dynamic import to prevent bundling in browser builds
 */
export async function initFileSystem () {
    if (isNode && fsModule === null) {
        try {
            // Dynamic import with webpackIgnore to prevent bundling
            fsModule = await import(/* webpackIgnore: true */ 'node:fs/promises');
        } catch (e) {
            // Silent fail in browser or if fs is unavailable
            fsModule = null;
        }
    }
    return fsModule;
}

/*  ------------------------------------------------------------------------ */

/**
 * Initialize synchronous file system module (Node.js only)
 * Uses dynamic import to prevent bundling in browser builds
 */
export async function initFileSystemSync () {
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

/*  ------------------------------------------------------------------------ */

/**
 * Read file contents (Node.js only)
 * @param path File path to read
 * @param encoding File encoding (default: 'utf8')
 * @returns File contents as string, or undefined in browser
 */
export async function readFile (path: string, encoding: BufferEncoding = 'utf8'): Promise<string | undefined> {
    if (!isNode) {
        return undefined;
    }
    const fs = await initFileSystem();
    if (fs) {
        return await fs.readFile(path, encoding);
    }
    return undefined;
}

/*  ------------------------------------------------------------------------ */

/**
 * Write file contents (Node.js only)
 * @param path File path to write
 * @param data Data to write
 * @param encoding File encoding (default: 'utf8')
 */
export async function writeFile (path: string, data: string, encoding: BufferEncoding = 'utf8'): Promise<void> {
    if (!isNode) {
        return;
    }
    const fs = await initFileSystem();
    if (fs) {
        await fs.writeFile(path, data, encoding);
    }
}

/*  ------------------------------------------------------------------------ */

/**
 * Check if file exists (Node.js only)
 * @param path File path to check
 * @returns true if file exists, false otherwise
 */
export async function fileExists (path: string): Promise<boolean> {
    if (!isNode) {
        return false;
    }
    const fs = await initFileSystem();
    if (fs) {
        try {
            await fs.access(path);
            return true;
        } catch (e) {
            return false;
        }
    }
    return false;
}

/*  ------------------------------------------------------------------------ */

/**
 * Read directory contents (Node.js only)
 * @param path Directory path to read
 * @returns Array of file/directory names, or empty array in browser
 */
export async function readDir (path: string): Promise<string[]> {
    if (!isNode) {
        return [];
    }
    const fs = await initFileSystem();
    if (fs) {
        return await fs.readdir(path);
    }
    return [];
}

/*  ------------------------------------------------------------------------ */

/**
 * Read file contents synchronously (Node.js only)
 * @param path File path to read
 * @param encoding File encoding (default: 'utf8')
 * @returns File contents as string, or undefined in browser
 */
export function readFileSync (path: string, encoding: BufferEncoding = 'utf8'): string | undefined {
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
export function writeFileSync (path: string, data: string, encoding: BufferEncoding = 'utf8'): void {
    if (!isNode) {
        return;
    }
    if (fsSyncModule === null) {
        // Sync module not initialized yet
        return;
    }
    try {
        fsSyncModule.writeFileSync(path, data, encoding);
    } catch (e) {
        // Silent fail
    }
}

/*  ------------------------------------------------------------------------ */

/**
 * Check if file exists synchronously (Node.js only)
 * @param path File path to check
 * @returns true if file exists, false otherwise
 */
export function fileExistsSync (path: string): boolean {
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

/*  ------------------------------------------------------------------------ */

/**
 * Read directory contents synchronously (Node.js only)
 * @param path Directory path to read
 * @returns Array of file/directory names, or empty array in browser
 */
export function readDirSync (path: string): string[] {
    if (!isNode) {
        return [];
    }
    if (fsSyncModule === null) {
        // Sync module not initialized yet
        return [];
    }
    try {
        return fsSyncModule.readdirSync(path);
    } catch (e) {
        return [];
    }
}

/*  ------------------------------------------------------------------------ */

/**
 * Delete file (Node.js only)
 * @param path File path to delete
 */
export async function deleteFile (path: string): Promise<void> {
    if (!isNode) {
        return;
    }
    const fs = await initFileSystem();
    if (fs) {
        try {
            await fs.unlink(path);
        } catch (e) {
            // Silent fail if file doesn't exist or can't be deleted
        }
    }
}

/*  ------------------------------------------------------------------------ */

/**
 * Delete file synchronously (Node.js only)
 * @param path File path to delete
 */
export function deleteFileSync (path: string): void {
    if (!isNode) {
        return;
    }
    if (fsSyncModule === null) {
        // Sync module not initialized yet
        return;
    }
    try {
        fsSyncModule.unlinkSync(path);
    } catch (e) {
        // Silent fail if file doesn't exist or can't be deleted
    }
}

/*  ------------------------------------------------------------------------ */

/**
 * Create directory (Node.js only)
 * @param path Directory path to create
 * @param options Options for directory creation (recursive: true by default)
 */
export async function directoryCreate (path: string, options: { recursive?: boolean } = { recursive: true }): Promise<void> {
    if (!isNode) {
        return;
    }
    const fs = await initFileSystem();
    if (fs) {
        try {
            await fs.mkdir(path, options);
        } catch (e) {
            // Silent fail if directory already exists or can't be created
        }
    }
}

/*  ------------------------------------------------------------------------ */

/**
 * Check if directory exists (Node.js only)
 * @param path Directory path to check
 * @returns true if directory exists, false otherwise
 */
export async function directoryExists (path: string): Promise<boolean> {
    if (!isNode) {
        return false;
    }
    const fs = await initFileSystem();
    if (fs) {
        try {
            const stats = await fs.stat(path);
            return stats.isDirectory();
        } catch (e) {
            return false;
        }
    }
    return false;
}

/*  ------------------------------------------------------------------------ */

/**
 * Delete directory (Node.js only)
 * @param path Directory path to delete
 * @param options Options for directory deletion (recursive: true by default)
 */
export async function directoryDelete (path: string, options: { recursive?: boolean } = { recursive: true }): Promise<void> {
    if (!isNode) {
        return;
    }
    const fs = await initFileSystem();
    if (fs) {
        try {
            await fs.rm(path, options);
        } catch (e) {
            // Silent fail if directory doesn't exist or can't be deleted
        }
    }
}

/*  ------------------------------------------------------------------------ */
