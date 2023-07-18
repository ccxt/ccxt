
import assert from 'assert';
import testSharedMethods from './test.sharedMethods.js';

function testCurrency (exchange, skippedProperties, method, entry) {
    const commonFormat = {
        'info': {},
        'id': 'btc', // string literal for referencing within an exchange
        'withdraw': true, // withdraw enabled
        'deposit': true, // deposit enabled
        'precision': exchange.parseNumber ('0.0001'), // would be integer in case of SIGNIFICANT_DIGITS
        'fee': exchange.parseNumber ('0.001'),
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
    const currencyFormat = exchange.deepExtend (commonFormat, {
        'code': 'BTC', // uppercase string literal of a currency
        'name': 'Bitcoin', // uppercase string, base currency
        'active': true, // if deposit/withdraw enabled
        'networks': {},
    });
    const networkFormat = exchange.deepExtend (commonFormat, {
        'network': 'BEP20', // can be either uppercase unified code or lowercase network id
    });
    testCommonCurrencyEntry (exchange, skippedProperties, method, entry, currencyFormat);
    testSharedMethods.assertCurrencyCode (exchange, skippedProperties, method, entry, entry['code']);
    // check valid ID & CODE
    testSharedMethods.assertValidCurrencyIdAndCode (exchange, skippedProperties, method, entry, entry['id'], entry['code']);
    // check network entries
    const networks = entry['networks'];
    if (!('networks' in skippedProperties)) {
        // networks have the same format as root currency format, however
        const networksKeys = Object.keys (networks);
        for (let i = 0; i < networksKeys.length; i++) {
            const networkCode = networksKeys[i];
            const networkEntry = networks[networkCode];
            testCommonCurrencyEntry (exchange, skippedProperties, method, networkEntry, networkFormat);
        }
    }
}

function testCommonCurrencyEntry (exchange, skippedProperties, method, entry, format) {
    const emptyAllowedFor = [ 'name', 'fee', 'active' ]; // 'active' key is dynammically checked in the bottom
    testSharedMethods.assertStructure (exchange, skippedProperties, method, entry, format, emptyAllowedFor);
    //
    if (!('active' in skippedProperties)) {
        if (entry['deposit'] === undefined && entry['withdraw'] === undefined) {
            assert (entry['active'] === undefined, 'active must be undefined if deposit and withdraw are both undefined');
        }
        else if (entry['deposit'] === undefined || entry['withdraw'] === undefined) {
            assert (entry['active'] === undefined, 'active must be undefined if either deposit or withdraw is undefined');
        }
        else if (entry['deposit'] === false && entry['withdraw'] === false) {
            assert (entry['active'] === false, 'active must be false if deposit and withdraw are both false');
        }
        else if (entry['deposit'] === false || entry['withdraw'] === false) {
            assert (entry['active'] === false, 'active must be false if either deposit or withdraw is false');
        }
        else if (entry['deposit'] === true && entry['withdraw'] === true) {
            assert (entry['active'] === true, 'active must be true if deposit and withdraw are both true');
        }
    }
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
    }
}
export default testCurrency;
