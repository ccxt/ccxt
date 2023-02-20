'use strict'

const assert = require ('assert');
const Precise = require ('../../base/Precise');

function logTemplate (exchange, method, entry) {
    return ' <<< ' + exchange.id + ' ' + method + ' ::: ' + exchange.json (entry) + ' >>> ';
}

function testStructureKeys (exchange, method, entry, format, requiredValueKeys = []) {
    // define common log text
    const logText = logTemplate (exchange, method, entry);
    // ensure item is not null/undefined/unset
    assert (entry, 'item is null/undefined' + logText);
    // get all expected & predefined keys for this specific item and ensure thos ekeys exist in parsed structure
    if (typeof format === 'object') {
        assert (typeof entry === 'object', 'entry is not an object' + logText);
        const keys = Object.keys (format);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            assert (key in entry, key.toString () + ' key is missing from structure' + logText);
            const valueType = typeof entry[key];
            const expectedType = typeof format[key];
            if (exchange.inArray (key, requiredValueKeys)) {
                // if it was in required keys, then it should have value, not undefined
                assert (entry[key] !== undefined, key + ' key is undefined, but is required' + logText);
            } else {
                // if it was not in required keys, then tolerate undefined
                assert ((entry[key] === undefined) || (valueType === expectedType), key+ ' key is neither undefined, neither of expected type ' + expectedType + logText);
            }
        }
    } else {
        assert (Array.isArray (entry), 'entry is not an array' + logText);
        const actualLength = entry.length;
        const expectedLength = format.length;
        assert (actualLength === expectedLength, 'entry length is not equal to expected length of ' + expectedLength.toString () + logText);
        for (let i = 0; i < format.length; i++) {
            const expectedType = typeof format[i];
            // because of other langs, this is needed for arrays
            try {
                assert (typeof entry[i] === expectedType, i.toString () + ' index does not have an expected type ' + expectedType + logText);
            } catch (ex) {
                assert (false, i.toString () + ' index is missing from structure' + logText);
            }
        }
    }
}

function testCommonTimestamp (exchange, method, entry, nowToCheck = undefined) {
    // define common log text
    const logText = logTemplate (exchange, method, entry);
    // ensure timestamp exists in object
    assert ('timestamp' in entry, 'timestamp is missing from structure' + logText);
    const ts = entry['timestamp'];
    if (ts !== undefined) {
        assert (typeof ts === 'number', 'timestamp is not a number' + logText);
        assert (ts > 1230940800000, 'timestamp is impossible to be before 1230940800000 / 03.01.2009' + logText); // 03 Jan 2009 - first block
        assert (ts < 2147483648000, 'timestamp more than 2147483648000 / 19.01.2038' + logText); // 19 Jan 2038 - int32 overflows // 7258118400000  -> Jan 1 2200
        if (nowToCheck !== undefined) {
            assert (timestamp < nowToCheck + 60000, 'trade timestamp is not below current time. Returned datetime: ' + exchange.iso8601 (timestamp) + ', now: ' + exchange.iso8601 (nowToCheck) + logText);
        }
    }
    // we also test 'datetime' here because it's certain sibling of 'timestamp'
    assert ('datetime' in entry, 'datetime is missing from structure' + logText);
    const dt = entry['datetime'];
    if (dt !== undefined) {
        assert (typeof dt === 'string', 'datetime is not a string' + logText);
        assert (dt === exchange.iso8601 (entry['timestamp']), 'datetime is not iso8601 of timestamp' + logText);
    }
}

function testSymbol (exchange, method, entry, expectedSymbol) {
    const logText = logTemplate (exchange, method, entry);
    assert (expectedSymbol === entry['symbol'], 'symbol is not equal to requested symbol; returned: ' + entry['symbol'] + ' requested: ' + expectedSymbol + logText);
}

function testCyrrencyCode (exchange, method, entry, actualCode, expectedCode = undefined) {
    const logText = logTemplate (exchange, method, entry);
    if (actualCode !== undefined) {
        assert (typeof code === 'string', 'currency code should be either undefined or be a string' + logText);
        assert (actualCode in exchange.currencies, 'currency code should be present in exchange.currencies' + logText);
        if (expectedCode !== undefined) {
            assert (actualCode === expectedCode, 'currency code in response (' + actualCode + ') should be equal to expected code (' + expectedCode + ')' + logText);
        }
    }
}

function Gt (exchange, method, entry, key, compareTo) {
    const logText = logTemplate (exchange, method, entry);
    const value = exchange.safeString (entry, key);
    if (value !== undefined) {
        assert (Precise.stringGt (value, compareTo), key + ' is expected to be > ' + compareTo + logText);
    }
}

function Ge (exchange, method, entry, key, compareTo) {
    const logText = logTemplate (exchange, method, entry);
    const value = exchange.safeString (entry, key);
    if (value !== undefined) {
        assert (Precise.stringGe (value, compareTo), key + ' is expected to be >= ' + compareTo + logText);
    }
}

function Lt (exchange, method, entry, key, compareTo) {
    const logText = logTemplate (exchange, method, entry);
    const value = exchange.safeString (entry, key);
    if (value !== undefined) {
        assert (Precise.stringLt (value, compareTo), key + ' is expected to be < ' + compareTo + logText);
    }
}

function Le (exchange, method, entry, key, compareTo) {
    const logText = logTemplate (exchange, method, entry);
    const value = exchange.safeString (entry, key);
    if (value !== undefined) {
        assert (Precise.stringLe (value, compareTo), key + ' is expected to be <= ' + compareTo + logText);
    }
}

function checkAgainstArray (exchange, method, entry, key, expectedArray) {
    const logText = logTemplate (exchange, method, entry);
    const value = exchange.safeString (entry, key);
    if (value !== undefined) {
        assert (exchange.inArray (value, expectedArray), key + ' is expected to be in ' + expectedArray.join (',') + logText);
    }
}


function checkFeeObject (exchange, method, feeEntry) {
    const logText = logTemplate (exchange, method, entry);
    if (feeEntry !== undefined) {
        assert ('cost' in feeEntry, '"fee" should contain a "cost" key' + logText); 
        Ge (exchange, method, feeEntry, 'cost', '0');
        assert ('currency' in feeEntry, '"fee" should contain a "currency" key' + logText);
        testCyrrencyCode (exchange, method, entry, feeEntry['currency']);
    }
}

module.exports = {
    testCommonTimestamp,
    testStructureKeys,
    testSymbol,
    testCyrrencyCode,
    Gt,
    Ge,
    Lt,
    Le,
    checkAgainstArray,
    checkFeeObject,
};
