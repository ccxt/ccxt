
import testSharedMethods from './test.sharedMethods.js';

function testBorrowRate (exchange, method, entry, requestedCode) {
    const format = {
        'info': {}, // Or []
        'currency': 'USDT',
        'timestamp': 1638230400000,
        'datetime': '2021-11-30T00:00:00.000Z',
        'rate': exchange.parseNumber ('0.0006'), // Interest rate
        'period': 86400000, // Amount of time the interest rate is based on in milliseconds
    };
    const emptyNotAllowedFor = [ 'currency', 'rate' ];
    testSharedMethods.assertStructure (exchange, method, entry, format, emptyNotAllowedFor);
    testSharedMethods.assertTimestamp (exchange, method, entry);
    testSharedMethods.assertCurrencyCode (exchange, method, entry, entry['currency'], requestedCode);
    //
    // assert (borrowRate['period'] === 86400000 || borrowRate['period'] === 3600000) // Milliseconds in an hour or a day
    testSharedMethods.assertGreater (exchange, method, entry, 'rate', '0');
}

export default testBorrowRate;
