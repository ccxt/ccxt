// @ts-nocheck

import assert from 'assert';
import ccxt from '../../../../ccxt.js';

// js-only iso8601 coverage: these pins are deliberately NOT in the shared
// ts/src/test/base/test.datetime.ts, because the hand-written python/php/go
// implementations return different values for these inputs (None/null, no
// extended-year '+' prefix, go nulls timestamps <= 0). This folder is not
// scanned by the transpilers (build/transpile.ts reads ts/src/test/base/
// non-recursively), so these asserts only run against the JS implementation
function testIso8601JsSpecific () {

    const exchange = new ccxt.Exchange ({
        'id': 'sampleexchange',
    });

    // zero timestamp is valid in JS (go returns nil for ts <= 0)
    assert (exchange.iso8601 (0) === '1970-01-01T00:00:00.000Z');
    // string inputs are parsed with parseInt (python returns None)
    assert (exchange.iso8601 ('1755432123456') === '2025-08-17T12:02:03.456Z');
    assert (exchange.iso8601 ('123abc') === '1970-01-01T00:00:00.123Z');
    // float inputs are floored (python/php return None/null)
    assert (exchange.iso8601 (514862627559.9) === '1986-04-26T01:23:47.559Z');
    // last representable millisecond of year 9999
    assert (exchange.iso8601 (253402300799999) === '9999-12-31T23:59:59.999Z');    // extended years above 9999 use the '+YYYYYY' format, byte-identical to
    // new Date (ms).toISOString () — python returns None, php/go drop the '+'
    assert (exchange.iso8601 (253402300800000) === '+010000-01-01T00:00:00.000Z');
    assert (exchange.iso8601 (253402300800001) === '+010000-01-01T00:00:00.001Z');
    assert (exchange.iso8601 (8640000000000000) === '+275760-09-13T00:00:00.000Z');
    // one millisecond above the maximum valid Date range yields undefined
    assert (exchange.iso8601 (8640000000000001) === undefined);
    // sanity: the extended-year and fast paths agree with the native formatter
    for (let t = 253402300700000; t < 253402301000000; t += 13337) {
        assert (exchange.iso8601 (t) === new Date (t).toISOString ());
    }
    for (let t = 8630000000000000; t <= 8640000000000000; t += 333333337) {
        assert (exchange.iso8601 (t) === new Date (t).toISOString ());
    }
    // modern-range sweep: guards the iso8601Years lookup table and the
    // month-day math in the common (non-extended-year) fast path
    // 1230768000000 = 2009-01-01T00:00:00.000Z, 2051222400000 = 2035-01-01T00:00:00.000Z
    for (let t = 1230768000000; t < 2051222400000; t += 987654321) {
        assert (exchange.iso8601 (t) === new Date (t).toISOString ());
    }
}

export default testIso8601JsSpecific;
