'use strict'

const assert = require ('assert');

function testCommonTimestamp (exchange, method, container) {

    // define common log text
    const logText = ' <<< ' + exchange.id + ' ' + method + ' ::: ' + exchange.json (container) + ' >>> ';

    // ensure timestamp exists in object
    assert (('timestamp' in container), 'timestamp is missing from structure' + logText);
    const ts = container['timestamp'];
    if (ts !== undefined) {
        assert (typeof ts === 'number', 'timestamp is not a number' + logText);
        assert (ts > 1230940800000, 'timestamp is impossible to be before 1230940800000 / 03.01.2009' + logText); // 03 Jan 2009 - first block
        assert (ts < 2147483648000, 'timestamp more than 2147483648000 / 19.01.2038' + logText); // 19 Jan 2038 - int32 overflows // 7258118400000  -> Jan 1 2200
        // check it's integer
    }

    // we also test 'datetime' here because it's certain sibling of 'timestamp'
    assert (('datetime' in container), 'datetime is missing from structure' + logText);
    const dt = container['datetime'];
    if (dt !== undefined) {
        assert (typeof dt === 'string', 'datetime is not a string' + logText);
        assert (dt === exchange.iso8601 (container['timestamp']), 'datetime is not iso8601 of timestamp' + logText);
    }
}

function testStructureKeys (exchange, method, container, format) {

    // define common log text
    const logText = ' <<< ' + exchange.id + ' ' + method + ' ::: ' + exchange.json (container) + ' >>> ';

    // ensure item is not null/undefined/unset
    assert (container, 'item is null/undefined' + logText);

    // get all expected & predefined keys for this specific item and ensure thos ekeys exist in parsed structure
    let keysHolder = undefined;
    if (typeof format === 'object') {
        keysHolder = Object.keys (format);
    } else {
        keysHolder = format;
    }
    for (let i = 0; i < keysHolder.length; i++) {
        const key = keysHolder[i];
        assert ((key in container), key + ' is missing from structure' + logText);
    }
}

function testId (exchange, method, container) {

    // define common log text
    const logText = ' <<< ' + exchange.id + ' ' + method + ' ::: ' + exchange.json (container) + ' >>> ';

    assert ((container['id'] === undefined) || (typeof container['id'] === 'string'), 'id is not correctly set' + logText);
}

module.exports = {
    testCommonTimestamp,
    testStructureKeys,
    testId,
};
