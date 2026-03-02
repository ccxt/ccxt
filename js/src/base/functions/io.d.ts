/// <reference types="node" />
/**
 * Initialize synchronous file system module (Node.js only)
 * Uses dynamic import to prevent bundling in browser builds
 */
export declare function initFileSystem(): Promise<void>;
/**
 * Get system temporary directory (Node.js only)
 * @returns Temporary directory path with trailing slash, or undefined
 */
export declare function getTempDir(): string | undefined;
/**
 * Read file contents synchronously (Node.js only)
 * @param path File path to read
 * @param encoding File encoding (default: 'utf8')
 * @returns File contents as string, or undefined in browser
 */
export declare function readFile(path: string, encoding?: BufferEncoding): string | undefined;
/**
 * Write file contents synchronously (Node.js only)
 * @param path File path to write
 * @param data Data to write
 * @param encoding File encoding (default: 'utf8')
 */
export declare function writeFile(path: string, data: string, encoding?: BufferEncoding): boolean;
/**
 * Check if file exists synchronously (Node.js only)
 * @param path File path to check
 * @returns true if file exists, false otherwise
 */
export declare function existsFile(path: string): boolean;
