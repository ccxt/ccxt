'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var base = require('./base.js');

/**
 * @typedef {{ address?: string, code: string, dest?: string, errno: number, info?: object, message: string, path?: string, port?: number, syscall: string}} SystemError
*/
/**
 * FetchError interface for operational errors
 */
class FetchError extends base.FetchBaseError {
    /**
     * @param  {string} message -      Error message for human
     * @param  {string} [type] -        Error type for machine
     * @param  {SystemError} [systemError] - For Node.js system error
     */
    constructor(message, type, systemError) {
        super(message, type);
        // When err.type is `system`, err.erroredSysCall contains system error and err.code contains system error code
        if (systemError) {
            // eslint-disable-next-line no-multi-assign
            this.code = this.errno = systemError.code;
            this.erroredSysCall = systemError.syscall;
        }
    }
}

exports.FetchError = FetchError;
