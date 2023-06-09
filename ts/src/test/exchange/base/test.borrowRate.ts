
import testSharedMethods from './test.sharedMethods.js';

function testBorrowRate (exchange, skippedProperties, method, entry, requestedCode) {
    const format = {
        'info': {}, // Or []
        'currency': 'USDT',
        'timestamp': 1638230400000,
        'datetime': '2021-11-30T00:00:00.000Z',
        'rate': exchange.parseNumber ('0.0006'), // Interest rate
        'period': 86400000, // Amount of time the interest rate is based on in milliseconds
    };
    testSharedMethods.assertStructure (exchange, skippedProperties, method, entry, format);
    testSharedMethods.assertTimestamp (exchange, skippedProperties, method, entry);
    testSharedMethods.assertCurrencyCode (exchange, skippedProperties, method, entry, entry['currency'], requestedCode);
    //
    // assert (borrowRate['period'] === 86400000 || borrowRate['period'] === 3600000) // Milliseconds in an hour or a day
    testSharedMethods.assertGreater (exchange, skippedProperties, method, entry, 'period', '0');
    testSharedMethods.assertGreater (exchange, skippedProperties, method, entry, 'rate', '0');
}

export default testBorrowRate;
