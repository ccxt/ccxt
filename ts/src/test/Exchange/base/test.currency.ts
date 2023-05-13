
import testSharedMethods from './test.sharedMethods.js';

function testCurrency (exchange, skippedProperties, method, entry) {
    const format = {
        'id': 'btc', // string literal for referencing within an exchange
        'code': 'BTC', // uppercase string literal of a pair of currencies
    };
    // todo: remove fee from empty
    const emptyAllowedFor = [ 'name', 'fee' ];
    // todo: info key needs to be added in base, when exchange does not have fetchCurrencies
    const isNative = exchange.has['fetchCurrencies'] && exchange.has['fetchCurrencies'] !== 'emulated';
    if (isNative) {
        format['info'] = {};
        // todo: 'name': 'Bitcoin', // uppercase string, base currency, 2 or more letters
        format['withdraw'] = true; // withdraw enabled
        format['deposit'] = true; // deposit enabled
        format['precision'] = exchange.parseNumber ('0.0001'); // in case of SIGNIFICANT_DIGITS it will be 4 - number of digits "after the dot"
        format['fee'] = exchange.parseNumber ('0.001');
        format['networks'] = {};
        format['limits'] = {
            'withdraw': {
                'min': exchange.parseNumber ('0.01'),
                'max': exchange.parseNumber ('1000'),
            },
            'deposit': {
                'min': exchange.parseNumber ('0.01'),
                'max': exchange.parseNumber ('1000'),
            },
        };
    }
    testSharedMethods.assertStructure (exchange, skippedProperties, method, entry, format, emptyAllowedFor);
    testSharedMethods.assertCurrencyCode (exchange, skippedProperties, method, entry, entry['code']);
    //
    testSharedMethods.checkPrecisionAccuracy (exchange, skippedProperties, method, entry, 'precision');
    testSharedMethods.assertGreaterOrEqual (exchange, skippedProperties, method, entry, 'fee', '0');
    if (!('limits' in skippedProperties)) {
        const limits = exchange.safeValue (entry, 'limits', {});
        const withdrawLimits = exchange.safeValue (limits, 'withdraw', {});
        const depositLimits = exchange.safeValue (limits, 'deposit', {});
        testSharedMethods.assertGreaterOrEqual (exchange, skippedProperties, method, withdrawLimits, 'min', '0');
        testSharedMethods.assertGreaterOrEqual (exchange, skippedProperties, method, withdrawLimits, 'max', '0');
        testSharedMethods.assertGreaterOrEqual (exchange, skippedProperties, method, depositLimits, 'min', '0');
        testSharedMethods.assertGreaterOrEqual (exchange, skippedProperties, method, depositLimits, 'max', '0');
        // max should be more than min (withdrawal limits)
        const minStringWithdrawal = exchange.safeString (withdrawLimits, 'min');
        if (minStringWithdrawal !== undefined) {
            testSharedMethods.assertGreaterOrEqual (exchange, skippedProperties, method, withdrawLimits, 'max', minStringWithdrawal);
        }
        // max should be more than min (deposit limits)
        const minStringDeposit = exchange.safeString (depositLimits, 'min');
        if (minStringDeposit !== undefined) {
            testSharedMethods.assertGreaterOrEqual (exchange, skippedProperties, method, depositLimits, 'max', minStringDeposit);
        }
        // check valid ID & CODE
        testSharedMethods.assertValidCurrencyIdAndCode (exchange, skippedProperties, method, entry, entry['id'], entry['code']);
        // todo: networks check
    }
}

export default testCurrency;
