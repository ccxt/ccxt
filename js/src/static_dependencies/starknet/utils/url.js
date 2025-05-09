// import urljoin from 'url-join';
/**
 * Inspired from https://github.com/segmentio/is-url
 */
/**
 * RegExps.
 * A URL must match #1 and then at least one of #2/#3.
 * Use two levels of REs to avoid REDOS.
 */
const protocolAndDomainRE = /^(?:\w+:)?\/\/(\S+)$/;
const localhostDomainRE = /^localhost[:?\d]*(?:[^:?\d]\S*)?$/;
const nonLocalhostDomainRE = /^[^\s.]+\.\S{2,}$/;
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
export function isUrl(s) {
    if (!s) {
        return false;
    }
    if (typeof s !== 'string') {
        return false;
    }
    const match = s.match(protocolAndDomainRE);
    if (!match) {
        return false;
    }
    const everythingAfterProtocol = match[1];
    if (!everythingAfterProtocol) {
        return false;
    }
    if (localhostDomainRE.test(everythingAfterProtocol) ||
        nonLocalhostDomainRE.test(everythingAfterProtocol)) {
        return true;
    }
    return false;
}
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
export function buildUrl(baseUrl, defaultPath, urlOrPath) {
    return urlOrPath;
    // return isUrl(urlOrPath) ? urlOrPath! : urljoin(baseUrl, urlOrPath ?? defaultPath);
}
