
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
    testSharedMethods.assertTimestampAndDatetime (exchange, skippedProperties, method, entry, now, 0);
    const logText = testSharedMethods.logTemplate (exchange, method, entry);
    //
    assert (entry.length >= 6, 'ohlcv array length should be >= 6;' + logText);
    const ts = exchange.safeString (entry, 0);
    assert ((('roundTimestamp' in skippedProperties) || ts.endsWith ('0000')), 'timestamp should be in milliseconds and is expected to end with 0000;' + logText);
    const high = exchange.safeString (entry, 2);
    const low = exchange.safeString (entry, 3);
    testSharedMethods.assertLessOrEqual (exchange, skippedProperties, method, entry, '1', high);
    testSharedMethods.assertGreaterOrEqual (exchange, skippedProperties, method, entry, '1', low);
    testSharedMethods.assertLessOrEqual (exchange, skippedProperties, method, entry, '4', high);
    testSharedMethods.assertGreaterOrEqual (exchange, skippedProperties, method, entry, '4', low);
    assert ((symbol === undefined) || (typeof symbol === 'string'), 'symbol ' + symbol + ' is incorrect' + logText); // todo: check with standard symbol check
}

export default testOHLCV;
