/**
 * Fetch function
 *
 * @param   {string | URL | import('./request').default} url - Absolute url or Request instance
 * @param   {*} [options_] - Fetch options
 * @return  {Promise<import('./response').default>}
 */
export default function fetch(url: string | URL | import('./request').default, options_?: any): Promise<import('./response').default>;
import Headers from "./headers.js";
import Request from "./request.js";
import Response from "./response.js";
import { FetchError } from "./errors/fetch-error.js";
import { AbortError } from "./errors/abort-error.js";
import { isRedirect } from "./utils/is-redirect.js";
export { Headers, Request, Response, FetchError, AbortError, isRedirect };
