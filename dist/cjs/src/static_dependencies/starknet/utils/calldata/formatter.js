'use strict';

var num = require('../num.js');
var shortString = require('../shortString.js');

// ----------------------------------------------------------------------------
const guard = {
    isBN: (data, type, key) => {
        if (!num.isBigInt(data[key]))
            throw new Error(`Data and formatter mismatch on ${key}:${type[key]}, expected response data ${key}:${data[key]} to be BN instead it is ${typeof data[key]}`);
    },
    unknown: (data, type, key) => {
        throw new Error(`Unhandled formatter type on ${key}:${type[key]} for data ${key}:${data[key]}`);
    },
};
/**
 * Formats the given data based on the provided type definition.
 *
 * @param {any} data - The data to be formatted.
 * @param {any} type - The type definition for the data.
 * @param {any} [sameType] - The same type definition to be used (optional).
 * @returns - The formatted data.
 */
function formatter(data, type, sameType) {
    // match data element with type element
    return Object.entries(data).reduce((acc, [key, value]) => {
        const elType = sameType ?? type[key];
        if (!(key in type) && !sameType) {
            // no type definition for element return original element
            acc[key] = value;
            return acc;
        }
        if (elType === 'string') {
            if (Array.isArray(data[key])) {
                // long string (felt*)
                const arrayStr = formatter(data[key], data[key].map((_) => elType));
                acc[key] = Object.values(arrayStr).join('');
                return acc;
            }
            guard.isBN(data, type, key);
            acc[key] = shortString.decodeShortString(value);
            return acc;
        }
        if (elType === 'number') {
            guard.isBN(data, type, key);
            acc[key] = Number(value);
            return acc;
        }
        if (typeof elType === 'function') {
            acc[key] = elType(value);
            return acc;
        }
        if (Array.isArray(elType)) {
            const arrayObj = formatter(data[key], elType, elType[0]);
            acc[key] = Object.values(arrayObj);
            return acc;
        }
        if (typeof elType === 'object') {
            acc[key] = formatter(data[key], elType);
            return acc;
        }
        guard.unknown(data, type, key);
        return acc;
    }, {});
}

module.exports = formatter;
