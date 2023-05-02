
import assert from 'assert';
import testSharedMethods from './test.sharedMethods.js';

function testOHLCV (exchange, skippedProperties, method, entry, symbol, now) {
    const format = [
        1638230400000,
        exchange.parseNumber ('0.123'),
        exchange.parseNumber ('0.125'),
        exchange.parseNumber ('0.121'),
        exchange.parseNumber ('0.122'),
        exchange.parseNumber ('123.456'),
    ];
    const emptyNotAllowedFor = [ 0, 1, 2, 3, 4, 5 ];
    testSharedMethods.assertStructure (exchange, skippedProperties, method, entry, format, emptyNotAllowedFor);
    testSharedMethods.assertTimestamp (exchange, skippedProperties, method, entry, now, 0);
    const logText = testSharedMethods.logTemplate (exchange, method, entry);
    //
    const length = entry.length;
    assert (length >= 6, 'ohlcv array length should be >= 6;' + logText);
    const o = exchange.safeString (entry, 1);
    const h = exchange.safeString (entry, 2);
    const l = exchange.safeString (entry, 3);
    const c = exchange.safeString (entry, 4);
    testSharedMethods.assertLessOrEqual (exchange, skippedProperties, method, entry, '1', h);
    testSharedMethods.assertGreaterOrEqual (exchange, skippedProperties, method, entry, '1', l);
    testSharedMethods.assertLessOrEqual (exchange, skippedProperties, method, entry, '4', h);
    testSharedMethods.assertGreaterOrEqual (exchange, skippedProperties, method, entry, '4', l);
    assert ((symbol === undefined) || (typeof symbol === 'string'), 'symbol ' + symbol + ' is incorrect' + logText); // todo: check with standard symbol check
}

export default testOHLCV;
