
import assert from 'assert';
import testSharedMethods from './test.sharedMethods.js';

function testOHLCV (exchange, method, entry, symbol, now) {
    const format = [
        1638230400000,
        exchange.parseNumber ('0.123'),
        exchange.parseNumber ('0.125'),
        exchange.parseNumber ('0.121'),
        exchange.parseNumber ('0.122'),
        exchange.parseNumber ('123.456'),
    ];
    const emptyNotAllowedFor = [ 0, 1, 2, 3, 4, 5 ];
    testSharedMethods.assertStructure (exchange, method, entry, format, emptyNotAllowedFor);
    testSharedMethods.assertTimestamp (exchange, method, entry, now, 0);
    const logText = testSharedMethods.logTemplate (exchange, method, entry);
    //
    const length = entry.length;
    assert (length >= 6, 'ohlcv array length should be >= 6;' + logText);
    const skippedExchanges = [
        // 'bitmex', // BitMEX API docs: also note the open price is equal to the close price of the previous timeframe bucket.
    ];
    if (!exchange.inArray (exchange.id, skippedExchanges)) {
        assert ((entry[1] === undefined) || (entry[2] === undefined) || (entry[1] <= entry[2]), 'open > high, ' + exchange.safeString (entry, 1, 'undefined') + ' > ' + exchange.safeString (entry, 2, 'undefined')); // open <= high
        assert ((entry[3] === undefined) || (entry[2] === undefined) || (entry[3] <= entry[2]), 'low > high, ' + exchange.safeString (entry, 2, 'undefined') + ' > ' + exchange.safeString (entry, 3, 'undefined')); // low <= high
        assert ((entry[3] === undefined) || (entry[4] === undefined) || (entry[3] <= entry[4]), 'low > close, ' + exchange.safeString (entry, 3, 'undefined') + ' > ' + exchange.safeString (entry, 4, 'undefined')); // low <= close
    }
    assert ((symbol === undefined) || (typeof symbol === 'string'), 'symbol ' + symbol + ' is incorrect' + logText);
}

export default testOHLCV;
