/**
 * AbortError interface for cancelled requests
 */
export class AbortError extends FetchBaseError {
    constructor(message: any, type?: string);
}
import { FetchBaseError } from "./base.js";
