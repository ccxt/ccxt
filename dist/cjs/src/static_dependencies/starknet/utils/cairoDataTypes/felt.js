'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var num = require('../num.js');
var shortString = require('../shortString.js');

// ----------------------------------------------------------------------------
/**
 * Create felt Cairo type (cairo type helper)
 * @returns format: felt-string
 */
function CairoFelt(it) {
    // BN or number
    if (num.isBigInt(it) || Number.isInteger(it)) {
        return it.toString();
    }
    // Handling strings
    if (shortString.isString(it)) {
        // Hex strings
        if (num.isHex(it)) {
            return BigInt(it).toString();
        }
        // Text strings that must be short
        if (shortString.isText(it)) {
            if (!shortString.isShortString(it)) {
                throw new Error(`${it} is a long string > 31 chars. Please split it into an array of short strings.`);
            }
            // Assuming encodeShortString returns a hex representation of the string
            return BigInt(shortString.encodeShortString(it)).toString();
        }
        // Whole numeric strings
        if (num.isStringWholeNumber(it)) {
            return it;
        }
    }
    // bool to felt
    if (num.isBoolean(it)) {
        return `${+it}`;
    }
    throw new Error(`${it} can't be computed by felt()`);
}

exports.CairoFelt = CairoFelt;
