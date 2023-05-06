
import testSharedMethods from './test.sharedMethods.js';

function testCurrency (exchange, method, entry) {
    const format = {
        'info': {},
        'id': 'btc', // string literal for referencing within an exchange
        'code': 'BTC', // uppercase string literal of a pair of currencies
        'name': 'Bitcoin', // uppercase string, base currency, 2 or more letters
        'withdraw': true, // withdraw enabled
        'deposit': true, // deposit enabled
        'precision': exchange.parseNumber ('0.0001'), // in case of SIGNIFICANT_DIGITS it will be 4 - number of digits "after the dot"
        'fee': exchange.parseNumber ('0.001'), //
        'limits': {
            'withdraw': {
                'min': exchange.parseNumber ('0.01'),
                'max': exchange.parseNumber ('1000'),
            },
            'deposit': {
                'min': exchange.parseNumber ('0.01'),
                'max': exchange.parseNumber ('1000'),
            },
        },
    };
    const emptyNotAllowedFor = [ 'id', 'code' ];
    testSharedMethods.assertStructure (exchange, method, entry, format, emptyNotAllowedFor);
    testSharedMethods.assertCurrencyCode (exchange, method, entry, entry['code']);
    //
    testSharedMethods.assertGreater (exchange, method, entry, 'precision', '0');
    testSharedMethods.assertGreaterOrEqual (exchange, method, entry, 'fee', '0');
    const limits = exchange.safeValue (entry, 'limits', {});
    const withdrawLimits = exchange.safeValue (limits, 'withdraw', {});
    const depositLimits = exchange.safeValue (limits, 'deposit', {});
    testSharedMethods.assertGreaterOrEqual (exchange, method, withdrawLimits, 'min', '0');
    testSharedMethods.assertGreaterOrEqual (exchange, method, withdrawLimits, 'max', '0');
    testSharedMethods.assertGreaterOrEqual (exchange, method, depositLimits, 'min', '0');
    testSharedMethods.assertGreaterOrEqual (exchange, method, depositLimits, 'max', '0');
}

export default testCurrency;
