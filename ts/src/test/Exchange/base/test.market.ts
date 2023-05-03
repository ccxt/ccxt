import assert from 'assert';
import testSharedMethods from './test.sharedMethods.js';

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
            'price': exchange.parseNumber ('8'), // integer or fraction
            'amount': exchange.parseNumber ('8'), // integer or fraction
            'cost': exchange.parseNumber ('8'), // integer or fraction
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
    testSharedMethods.assertGreater (exchange, method, market, 'contractSize', '0');
    testSharedMethods.assertGreater (exchange, method, market, 'expiry', '0');
    testSharedMethods.assertGreater (exchange, method, market, 'strike', '0');
    testSharedMethods.assertInArray (exchange, method, market, 'optionType', [ 'put', 'call' ]);
    testSharedMethods.assertGreater (exchange, method, market, 'taker', '-100');
    testSharedMethods.assertGreater (exchange, method, market, 'maker', '-100');
    if (market['contract']) {
        assert (market['linear'] !== market['inverse'], 'market linear and inverse must not be the same' + logText);
    } else {
        assert ((market['linear'] === undefined) && (market['inverse'] === undefined), 'market linear and inverse must be undefined when "contract" is false' + logText);
    }
    if (market['option']) {
        assert (market['strike'] !== undefined, '"strike" must be defined when "option" is true' + logText);
        assert (market['optionType'] !== undefined, '"optionType" must be defined when "option" is true' + logText);
    }
    const validTypes = [ 'spot', 'margin', 'swap', 'future', 'option' ];
    testSharedMethods.assertInArray (exchange, method, market, 'type', validTypes);
    const types = validTypes;
    for (let i = 0; i < types.length; i++) {
        testSharedMethods.assertInArray (exchange, method, market, types[i], [ true, false, undefined ]);
    }
    if (market['future']) {
        assert (!market['swap'] && !market['option'], 'market swap and option must be false when "future" is true' + logText);
    } else if (market['swap']) {
        assert (!market['future'] && !market['option'], 'market future and option must be false when "swap" is true' + logText);
    } else if (market['option']) {
        assert (!market['future'] && !market['swap'], 'market future and swap must be false when "option" is true' + logText);
    }
    if (market['linear']) {
        assert (!market['inverse'], 'market inverse must be false when "linear" is true' + logText);
    } else if (market['inverse']) {
        assert (!market['linear'], 'market linear must be false when "inverse" is true' + logText);
    }
    if (market['future']) {
        assert (market['expiry'] !== undefined, '"expiry" must be defined when "future" is true' + logText);
        assert (market['expiryDatetime'] !== undefined, '"expiryDatetime" must be defined when "future" is true' + logText);
    }
    if (market['expiry'] !== undefined) {
        assert (market['expiryDatetime'] === exchange.iso8601 (market['expiry']), 'expiryDatetime must be equal to expiry in iso8601 format' + logText);
    }
    const targetKeys = [ 'cost', 'amount', 'price' ];
    // check precisions
    for (let i = 0; i < targetKeys.length; i++) {
        const key = targetKeys[i];
        // todo: should be migrated into assertGreater after TickSize handling is implemented
        testSharedMethods.assertGreaterOrEqual (exchange, method, market['precision'], key, '0');
    }
    // check limits
    for (let i = 0; i < targetKeys.length; i++) {
        const key = targetKeys[i];
        const limitEntry = market['limits'][key];
        testSharedMethods.assertGreaterOrEqual (exchange, method, limitEntry, 'min', '0');
        testSharedMethods.assertGreater (exchange, method, limitEntry, 'max', '0');
    }
}

export default testMarket;
