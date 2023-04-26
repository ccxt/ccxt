import assert from 'assert';
import testSharedMethods from './test.sharedMethods.js';
import Precise from '../../../base/Precise.js';

function testMarket (exchange, method, market) {
    const format = {
        'id': 'btcusd', // string literal for referencing within an exchange
        'symbol': 'BTC/USD', // uppercase string literal of a pair of currencies
        'base': 'BTC', // unified uppercase string, base currency, 3 or more letters
        'quote': 'USD', // unified uppercase string, quote currency, 3 or more letters
        'taker': exchange.parseNumber ('0.0011'), // taker fee, for example, 0.0011 = 0.11%
        'maker': exchange.parseNumber ('0.0009'), // maker fee, for example, 0.0009 = 0.09%
        'baseId': 'btc', // exchange-specific base currency id
        'quoteId': 'usd', // exchange-specific quote currency id
        'active': true, // boolean, market status
        'type': 'spot',
        'linear': false,
        'inverse': false,
        'spot': true,
        'swap': false,
        'future': false,
        'option': false,
        'margin': false,
        'contract': false,
        'contractSize': exchange.parseNumber ('0.001'),
        'expiry': 1656057600000,
        'expiryDatetime': '2022-06-24T08:00:00.000Z',
        'optionType': 'put',
        'strike': exchange.parseNumber ('56000'),
        'settle': 'XYZ',
        'settleId': 'Xyz',
        'precision': {
            // todo : handle precision types after another PR is merged
            'price': exchange.parseNumber ('0.001'), // integer or fraction
            'amount': exchange.parseNumber ('0.001'), // integer or fraction
            'cost': exchange.parseNumber ('0.001'), // integer or fraction
        },
        // value limits when placing orders on this market
        'limits': {
            'amount': {
                'min': exchange.parseNumber ('0.01'), // order amount should be > min
                'max': exchange.parseNumber ('1000'), // order amount should be < max
            },
            'price': {
                'min': exchange.parseNumber ('0.01'), // order price should be > min
                'max': exchange.parseNumber ('1000'), // order price should be < max
            },
            // order cost = price * amount
            'cost': {
                'min': exchange.parseNumber ('0.01'), // order cost should be > min
                'max': exchange.parseNumber ('1000'), // order cost should be < max
            },
        },
        'info': {}, // the original unparsed market info from the exchange
    };
    const emptyNotAllowedFor = [ 'id', 'symbol', 'base', 'quote', 'baseId', 'quoteId', 'precision', 'limits', 'type', 'spot', 'swap', 'future', 'contract' ];
    testSharedMethods.assertStructure (exchange, method, market, format, emptyNotAllowedFor);
    testSharedMethods.assertSymbol (exchange, method, market, 'symbol');
    const logText = testSharedMethods.logTemplate (exchange, method, market);
    //
    const validTypes = [ 'spot', 'margin', 'swap', 'future', 'option' ];
    testSharedMethods.assertInArray (exchange, method, market, 'type', validTypes);
    // check if string is consistent with 'type'
    if (market['spot'] === true) {
        assert (market['type'] === 'spot', 'market type must be "spot" when spot is true' + logText);
    } else if (market['swap'] === true) {
        assert (market['type'] === 'swap', 'market type must be "swap" when swap is true' + logText);
    } else if (market['future'] === true) {
        assert (market['type'] === 'future', 'market type must be "future" when future is true' + logText);
    } else if (market['option'] === true) {
        assert (market['type'] === 'option', 'market type must be "option" when option is true' + logText);
    }
    // margin check
    if (market['spot']) {
        // if it's spot market, 'margin' can be either true/false or undefined
        testSharedMethods.assertInArray (exchange, method, market, 'margin', [ true, false, undefined ]);
    } else {
        // otherwise, it must be false
        assert (market['margin'] === false, 'market margin must be false when spot is false' + logText);
    }
    // typical values
    testSharedMethods.assertGreater (exchange, method, market, 'contractSize', '0');
    testSharedMethods.assertGreater (exchange, method, market, 'expiry', '0');
    testSharedMethods.assertGreater (exchange, method, market, 'strike', '0');
    testSharedMethods.assertInArray (exchange, method, market, 'optionType', [ 'put', 'call' ]);
    testSharedMethods.assertGreater (exchange, method, market, 'taker', '-100');
    testSharedMethods.assertGreater (exchange, method, market, 'maker', '-100');
    // 'contract' boolean check
    if (market['future'] || market['swap'] || market['option']) {
        // if it's some kind of contract market, then `conctract` should be true
        assert (market['contract'], 'market contract must be true when "future", "swap" or "option" is true' + logText);
    } else {
        assert ((market['linear'] === undefined) && (market['inverse'] === undefined), 'market linear and inverse must be undefined when "contract" is false' + logText);
    }
    const contractSize = exchange.safeString (market, 'contractSize');
    // contract fields
    if (market['contract']) {
        // linear & inverse should have different values (true/false)
        assert (market['linear'] !== market['inverse'], 'market linear and inverse must not be the same' + logText);
        // contract size should be defined
        assert (contractSize !== undefined, '"contractSize" must be defined when "contract" is true' + logText);
        // contract size should be above zero
        assert (Precise.stringGt (contractSize, '0'), '"contractSize" must be > 0 when "contract" is true' + logText);
        // settle should be defined
        assert ((market['settle'] !== undefined) && (market['settleId'] !== undefined), '"settle" must be defined when "contract" is true' + logText);
        // spot should be false
        assert (market['spot'] === false, 'market spot must be false when "contract" is true' + logText);
    } else {
        // linear & inverse needs to be undefined
        assert ((market['linear'] === undefined) && (market['inverse'] === undefined), 'market linear and inverse must be undefined when "contract" is true' + logText);
        // contract size should be undefined
        assert (contractSize === undefined, '"contractSize" must be undefined when "contract" is false' + logText);
        // settle should be undefined
        assert ((market['settle'] === undefined) && (market['settleId'] === undefined), '"settle" must be defined when "contract" is true' + logText);
        // spot should be true
        assert (market['spot'] === true, 'market spot must be false when "contract" is true' + logText);
    }
    // option fields
    if (market['option']) {
        // if option, then strike and optionType should be defined
        assert (market['strike'] !== undefined, '"strike" must be defined when "option" is true' + logText);
        assert (market['optionType'] !== undefined, '"optionType" must be defined when "option" is true' + logText);
    } else {
        // if not option, then strike and optionType should be undefined
        assert (market['strike'] === undefined, '"strike" must be undefined when "option" is false' + logText);
        assert (market['optionType'] === undefined, '"optionType" must be undefined when "option" is false' + logText);
    }
    // future, swap and option should be mutually exclusive
    if (market['future']) {
        assert (!market['swap'] && !market['option'], 'market swap and option must be false when "future" is true' + logText);
    } else if (market['swap']) {
        assert (!market['future'] && !market['option'], 'market future and option must be false when "swap" is true' + logText);
    } else if (market['option']) {
        assert (!market['future'] && !market['swap'], 'market future and swap must be false when "option" is true' + logText);
    }
    // expiry field
    if (market['future'] || market['option']) {
        // future or option markets need 'expiry' and 'expiryDatetime'
        assert (market['expiry'] !== undefined, '"expiry" must be defined when "future" is true' + logText);
        assert (market['expiryDatetime'] !== undefined, '"expiryDatetime" must be defined when "future" is true' + logText);
        // expiry datetime should be correct
        assert (market['expiryDatetime'] === exchange.iso8601 (market['expiry']), 'expiryDatetime must be equal to expiry in iso8601 format' + logText);
    } else {
        // otherwise, they need to be undefined
        assert ((market['expiry'] === undefined) && (market['expiryDatetime'] === undefined), '"expiry" and "expiryDatetime" must be undefined when it is not future|option market' + logText);
    }
    // check precisions
    const precisionKeys = Object.keys (market['precision']);
    for (let i = 0; i < precisionKeys.length; i++) {
        testSharedMethods.checkPrecisionAccuracy (exchange, method, market['precision'], precisionKeys[i]);
    }
    // check limits
    const limitsKeys = Object.keys (market['limits']);
    for (let i = 0; i < limitsKeys.length; i++) {
        const key = limitsKeys[i];
        const limitEntry = market['limits'][key];
        testSharedMethods.assertGreaterOrEqual (exchange, method, limitEntry, 'min', '0');
        testSharedMethods.assertGreater (exchange, method, limitEntry, 'max', '0');
        const minString = exchange.safeString (limitEntry, 'min');
        if (minString !== undefined) {
            testSharedMethods.assertGreater (exchange, method, limitEntry, 'max', minString);
        }
    }
}

export default testMarket;
