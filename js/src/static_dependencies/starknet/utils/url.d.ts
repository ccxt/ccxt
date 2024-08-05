/**
 * Loosely validate a URL `string`.
 *
 * @param {string} s - The URL to check for
 * @return {boolean} `true` if url is valid, `false` otherwise
 * @example
 * ```typescript
 * const s = "https://starknetjs.com/docs";
 * const result = isUrl(s);
 * // result == true
 */
export declare function isUrl(s?: string): boolean;
/**
 * Builds a URL using the provided base URL, default path, and optional URL or path.
 *
 * @param {string} baseUrl - The base URL of the URL being built.
 * @param {string} defaultPath - The default path to use if no URL or path is provided.
 * @param {string} [urlOrPath] - The optional URL or path to append to the base URL.
 * @return {string} The built URL.
 * @example
 * ```typescript
 * const baseUrl = "https://starknetjs.com";
 * const defaultPath = "/";
 * const urlOrPath = "/docs";
 * const result = buildUrl(baseUrl, defaultPath, urlOrPath);
 *
 * result = "https://starknetjs.com/docs"
 */
export declare function buildUrl(baseUrl: string, defaultPath: string, urlOrPath?: string): string;
