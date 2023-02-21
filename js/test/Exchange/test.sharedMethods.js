'use strict'

const assert = require ('assert');
const Precise = require ('../../base/Precise');

function logTemplate (exchange, method, entry) {
    return ' <<< ' + exchange.id + ' ' + method + ' ::: ' + exchange.json (entry) + ' >>> ';
}

function reviseStructureKeys (exchange, method, entry, format, requiredValueKeys = []) {
    // define common log text
    const logText = logTemplate (exchange, method, entry);
    // ensure item is not null/undefined/unset
    assert (entry, 'item is null/undefined' + logText);
    // get all expected & predefined keys for this specific item and ensure thos ekeys exist in parsed structure
    if (Array.isArray (format)) {
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
    } else {
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
    }
}

function reviseCommonTimestamp (exchange, method, entry, nowToCheck = undefined, keyName = 'timestamp') {
    // define common log text
    const logText = logTemplate (exchange, method, entry);
    const isDateTimeObject = typeof keyName === 'string';
    // ensure timestamp exists in object
    if (isDateTimeObject) {
        assert (keyName in entry, 'timestamp key ' + keyName + ' is missing from structure' + logText);
    } else {
        assert (typeof entry[keyName] !== 'undefined', 'timestamp index '+ keyName + ' is missing from structure' + logText);
    }
    const ts = entry[keyName];
    if (ts !== undefined) {
        assert (typeof ts === 'number', 'timestamp is not a number' + logText);
        assert (ts > 1230940800000, 'timestamp is impossible to be before 1230940800000 / 03.01.2009' + logText); // 03 Jan 2009 - first block
        assert (ts < 2147483648000, 'timestamp more than 2147483648000 / 19.01.2038' + logText); // 19 Jan 2038 - int32 overflows // 7258118400000  -> Jan 1 2200
        if (nowToCheck !== undefined) {
            assert (ts < nowToCheck + 60000, 'trade timestamp is not below current time. Returned datetime: ' + exchange.iso8601 (ts) + ', now: ' + exchange.iso8601 (nowToCheck) + logText);
        }
    }
    // only in case if the entry is a dictionary, thus it must have 'timestamp' & 'datetime' string keys
    if (isDateTimeObject) {
        // we also test 'datetime' here because it's certain sibling of 'timestamp'
        assert ('datetime' in entry, 'datetime is missing from structure' + logText);
        const dt = entry['datetime'];
        if (dt !== undefined) {
            assert (typeof dt === 'string', 'datetime is not a string' + logText);
            assert (dt === exchange.iso8601 (entry['timestamp']), 'datetime is not iso8601 of timestamp' + logText);
        }
    }
}


function reviseCurrencyCode (exchange, method, entry, actualCode, expectedCode = undefined) {
    const logText = logTemplate (exchange, method, entry);
    if (actualCode !== undefined) {
        assert (typeof code === 'string', 'currency code should be either undefined or a string' + logText);
        assert (actualCode in exchange.currencies, 'currency code should be present in exchange.currencies' + logText);
        if (expectedCode !== undefined) {
            assert (actualCode === expectedCode, 'currency code in response (' + actualCode + ') should be equal to expected code (' + expectedCode + ')' + logText);
        }
    }
}

function reviseSymbol (exchange, method, entry, key, expectedSymbol = undefined) {
    const logText = logTemplate (exchange, method, entry);
    const actualSymbol = exchange.safeString (entry, key);
    if (actualSymbol !== undefined) {
        assert (typeof actualSymbol === 'string', 'symbol should be either undefined or a string' + logText);
        assert (actualSymbol in exchange.markets, 'symbol should be present in exchange.symbols' + logText);
    }
    if (expectedSymbol !== undefined) {
        assert (actualSymbol === expectedSymbol, 'symbol in response (' + actualSymbol + ') should be equal to expected symbol (' + expectedSymbol + ')' + logText);
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

function reviseAgainstArray (exchange, method, entry, key, expectedArray) {
    const logText = logTemplate (exchange, method, entry);
    const value = exchange.safeValue (entry, key);
    if (value !== undefined) {
        assert (exchange.inArray (value, expectedArray), '"' + key + '" key is expected to be one from: [' + expectedArray.join (',') + ']' + logText);
    }
}


function reviseFeeObject (exchange, method, entry) {
    const logText = logTemplate (exchange, method, entry);
    if (entry !== undefined) {
        assert ('cost' in entry, '"fee" should contain a "cost" key' + logText); 
        Ge (exchange, method, entry, 'cost', '0');
        assert ('currency' in entry, '"fee" should contain a "currency" key' + logText);
        reviseCurrencyCode (exchange, method, entry, entry['currency']);
    }
}

function reviseFeesObject (exchange, method, entry) {
    const logText = logTemplate (exchange, method, entry);
    if (entry !== undefined) {
        assert (Array.isArray (entry), '"fees" is not an array' +  logText);
        for (let i = 0; i < entry.length; i++) {
            reviseFeeObject (exchange, method, entry[i]);
        }
    }
}

module.exports = {
    logTemplate,
    reviseCommonTimestamp,
    reviseStructureKeys,
    reviseSymbol,
    reviseCurrencyCode,
    reviseAgainstArray,
    reviseFeeObject,
    reviseFeesObject,
    Gt,
    Ge,
    Lt,
    Le,
};
