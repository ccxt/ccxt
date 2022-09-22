'use strict'

const assert = require ('assert');

function testCommonTimestamp (exchange, method, container) {

    const msgPrefix = exchange.id + ' ' + method + ' : ';
    const json = exchange.json (container);

    assert ('timestamp' in container, msgPrefix + 'timestamp is missing from structure. ' + json);
    const ts = container['timestamp'];
    if (ts !== undefined) {
        assert (typeof ts === 'number');
        assert (ts > 1230940800000, msgPrefix + 'timestamp is impossible to be before 03.01.2009 ' + json); // 03 Jan 2009 - first block
        assert (ts < 2147483648000, msgPrefix + 'timestamp more than 19.01.2038; ' + json); // 19 Jan 2038 - int32 overflows // 7258118400000  -> Jan 1 2200
        // check it's integer
        assert (exchange.isInteger (ts), msgPrefix + 'timestamp not integer - ' + ts)
    }

    // we also test 'datetime' here because it's certain sibling of 'timestamp'
    assert ('datetime' in container, msgPrefix + 'datetime is missing from structure. ' + json);
    const dt = container['datetime'];
    if (dt !== undefined) {
        assert (typeof dt === 'string');
        assert (dt === exchange.iso8601 (container['timestamp']));
    }
}

module.exports = {
    testCommonTimestamp,
};
