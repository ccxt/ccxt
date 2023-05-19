
import testSharedMethods from './test.sharedMethods.js';

function testBorrowInterest (exchange, skippedProperties, method, entry, requestedCode, requestedSymbol) {
    const format = {
        'info': {},
        'account': 'BTC/USDT',
        'currency': 'USDT',
        'interest': exchange.parseNumber ('0.1444'),
        'interestRate': exchange.parseNumber ('0.0006'),
        'amountBorrowed': exchange.parseNumber ('30.0'),
        'timestamp': 1638230400000,
        'datetime': '2021-11-30T00:00:00.000Z',
    };
    const emptyAllowedFor = [ 'account' ];
    testSharedMethods.assertStructure (exchange, skippedProperties, method, entry, format, emptyAllowedFor);
    testSharedMethods.assertTimestamp (exchange, skippedProperties, method, entry);
    testSharedMethods.assertCurrencyCode (exchange, skippedProperties, method, entry, entry['currency'], requestedCode);
    testSharedMethods.assertSymbol (exchange, skippedProperties, method, entry, entry['account'], requestedSymbol);
    testSharedMethods.assertGreater (exchange, skippedProperties, method, entry, 'interest', '0');
    testSharedMethods.assertGreater (exchange, skippedProperties, method, entry, 'interestRate', '0');
    testSharedMethods.assertGreater (exchange, skippedProperties, method, entry, 'amountBorrowed', '0');
}

export default testBorrowInterest;
