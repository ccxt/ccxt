import { Exchange } from "../../../../ccxt";
import testSharedMethods from './test.sharedMethods.js';

function testIsolatedBorrowRate (exchange: Exchange, skippedProperties: object, method: string, entry: object, requestedCode: string) {
    const format = {
        'info': {}, // Or []
        'symbol': 'BTC/USDT',
        'base': 'BTC',
        'baseRate': exchange.parseNumber ('0.0006'), // Interest rate,
        'quote': 'USDT',
        'quoteRate': exchange.parseNumber ('0.0006'), // Interest rate,
        'timestamp': 1638230400000,
        'datetime': '2021-11-30T00:00:00.000Z',
        'period': 86400000, // Amount of time the interest rate is based on in milliseconds
    };
    testSharedMethods.assertStructure (exchange, skippedProperties, method, entry, format);
    testSharedMethods.assertTimestampAndDatetime (exchange, skippedProperties, method, entry);
    testSharedMethods.assertCurrencyCode (exchange, skippedProperties, method, entry, entry['base'], requestedCode);
    testSharedMethods.assertCurrencyCode (exchange, skippedProperties, method, entry, entry['quote'], requestedCode);
    testSharedMethods.assertSymbol (exchange, skippedProperties, method, entry, 'symbol', requestedCode);
    //
    // assert (borrowRate['period'] === 86400000 || borrowRate['period'] === 3600000) // Milliseconds in an hour or a day
    testSharedMethods.assertGreater (exchange, skippedProperties, method, entry, 'period', '0');
    testSharedMethods.assertGreater (exchange, skippedProperties, method, entry, 'baseRate', '0');
    testSharedMethods.assertGreater (exchange, skippedProperties, method, entry, 'quoteRate', '0');
}

export default testIsolatedBorrowRate;
