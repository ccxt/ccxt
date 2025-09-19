/**
 * Asserts that the given condition is true, otherwise throws an error with an optional message.
 * @param {any} condition - The condition to check.
 * @param {string} [message] - The optional message to include in the error.
 * @throws {Error} Throws an error if the condition is false.
 */
export default function assert(condition: boolean, message?: string): asserts condition;
