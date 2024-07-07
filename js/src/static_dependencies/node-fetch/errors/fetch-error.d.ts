/**
 * @typedef {{ address?: string, code: string, dest?: string, errno: number, info?: object, message: string, path?: string, port?: number, syscall: string}} SystemError
*/
/**
 * FetchError interface for operational errors
 */
export class FetchError extends FetchBaseError {
    /**
     * @param  {string} message -      Error message for human
     * @param  {string} [type] -        Error type for machine
     * @param  {SystemError} [systemError] - For Node.js system error
     */
    constructor(message: string, type?: string, systemError?: SystemError);
    code: string;
    errno: string;
    erroredSysCall: string;
}
export type SystemError = {
    address?: string;
    code: string;
    dest?: string;
    errno: number;
    info?: object;
    message: string;
    path?: string;
    port?: number;
    syscall: string;
};
import { FetchBaseError } from "./base.js";
