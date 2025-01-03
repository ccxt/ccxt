'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var base = require('./base.js');

/**
 * AbortError interface for cancelled requests
 */
class AbortError extends base.FetchBaseError {
    constructor(message, type = 'aborted') {
        super(message, type);
    }
}

exports.AbortError = AbortError;
