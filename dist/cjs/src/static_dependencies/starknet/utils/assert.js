'use strict';

/**
 * Asserts that the given condition is true, otherwise throws an error with an optional message.
 * @param {any} condition - The condition to check.
 * @param {string} [message] - The optional message to include in the error.
 * @throws {Error} Throws an error if the condition is false.
 */
function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failure');
    }
}

module.exports = assert;
