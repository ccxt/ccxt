import assert from 'assert';
import { Currency, Exchange } from "../../../../ccxt.js";
import testSharedMethods from './test.sharedMethods.js';

function testCurrency (exchange: Exchange, skippedProperties: object, method: string, entry: Currency) 
    const baseFormat = {
        'info': {},
        'id': 'btc', // string literal for referencing within an exchange
        'withdraw': true, // withdraw enabled
        'deposit': true, // deposit enabled
        'active': true, // if currency is active or not (or frozen)
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
    const currencyFormat = exchange.deepExtend (baseFormat, {
        'code': 'BTC', // uppercase string literal of a currency
        'name': 'Bitcoin', // uppercase string, base currency
        'networks': {},
        'type':  'crypto', // crypto, fiat, leverage, other
    });
    const networkFormat = exchange.deepExtend (baseFormat, {
        'network': 'BEP20', // can be either uppercase unified code or lowercase network id
    });
    helperTestSharedCurrencyFormat (exchange, skippedProperties, method, entry, currencyFormat);
    testSharedMethods.assertCurrencyCode (exchange, skippedProperties, method, entry, entry['code']);
    // check valid ID & CODE
    testSharedMethods.assertValidCurrencyIdAndCode (exchange, skippedProperties, method, entry, entry['id'], entry['code']);
    // check network entries
    if (!('networks' in skippedProperties)) {
        const networks = entry['networks'];
        const networkKeys = Object.keys (networks);
        const networkKeysLength = networkKeys.length;
        if (networkKeysLength === 0 && ('skipCurrenciesWithoutNetworks' in skippedProperties)) {
            return;
        }
        // check each network entry (they have somewhat similar structure as root currency structure)
        const networksKeys = Object.keys (networks);
        for (let i = 0; i < networksKeys.length; i++) {
            const networkCode = networksKeys[i];
            const networkEntry = networks[networkCode];
            helperTestSharedCurrencyFormat (exchange, skippedProperties, method, networkEntry, networkFormat);
        }
    }
}

function helperTestSharedCurrencyFormat (exchange, skippedProperties, method, entry, format) {
    const emptyAllowedFor = [ 'name', 'fee', 'active' ]; // 'active' key is dynammically checked in the bottom
    //
    try {
        testSharedMethods.assertStructure (exchange, skippedProperties, method, entry, format, emptyAllowedFor);
    } catch (e) {
        const message: string = exchange.exceptionMessage (e);
        // check structure if key is numeric, not string
        if (message.indexOf ('"id" key') >= 0) {
            format['id'] = 123;
            testSharedMethods.assertStructure (exchange, skippedProperties, method, entry, format, emptyAllowedFor);
        } else {
            assert (message === '', message);
        }
    }
    //
    if (!('active' in skippedProperties)) {
        if (entry['deposit'] === false && entry['withdraw'] === false) {
            assert (entry['active'] === false, 'active must be false if deposit and withdraw are both false');
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
