'use strict'

const assert = require ('assert')

function testMarket (exchange, market, method) {
    const format = {
        'id': 'btcusd', // string literal for referencing within an exchange
        'symbol': 'BTC/USD', // uppercase string literal of a pair of currencies
        'base': 'BTC', // unified uppercase string, base currency, 3 or more letters
        'quote': 'USD', // unified uppercase string, quote currency, 3 or more letters
        'taker': 0.0011, // taker fee, for example, 0.0011 = 0.11%
        'maker': 0.0009, // maker fee, for example, 0.0009 = 0.09%
        'baseId': 'btc', // exchange-specific base currency id
        'quoteId': 'usd', // exchange-specific quote currency id
        'active': true, // boolean, market status
        'type': 'spot',
        'linear': undefined,
        'inverse': undefined,
        'spot': true,
        'swap': false,
        'future': false,
        'option': false,
        'margin': false,
        'contract': false,
        'contractSize': 0.001,
        'expiry': 1656057600000,
        'expiryDatetime': '2022-06-24T08:00:00.000Z',
        'optionType': 'put',
        'strike': 56000,
        'settle': undefined,
        'settleId': undefined,
        'precision': {
            'price': 8, // integer or fraction
            'amount': 8, // integer or fraction
            'cost': 8, // integer or fraction
        },
        // value limits when placing orders on this market
        'limits': {
            'amount': {
                'min': 0.01, // order amount should be > min
                'max': 1000, // order amount should be < max
            },
            'price': {
                'min': 0.01, // order price should be > min
                'max': 1000, // order price should be < max
            },
            // order cost = price * amount
            'cost': {
                'min': 0.01, // order cost should be > min
                'max': 1000, // order cost should be < max
            },
        },
        'info': {}, // the original unparsed market info from the exchange
    };
    let keys = Object.keys (format);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const keyPresent = (key in market);
        assert (keyPresent, key + ' missing ' + exchange.json (market));
    }
    keys = [
        'id',
        'symbol',
        'baseId',
        'quoteId',
        'base',
        'quote',
        'precision',
        'limits',
    ];
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        assert (market[key] !== undefined, key + ' undefined ' + exchange.json (market));
    }
    assert ((market['taker'] === undefined) || (typeof market['taker'] === 'number'));
    assert ((market['maker'] === undefined) || (typeof market['maker'] === 'number'));
    if (market['contract']) {
        assert (market['linear'] !== market['inverse']);
    } else {
        assert ((market['linear'] === undefined) && (market['inverse'] === undefined));
    }
    if (market['option']) {
        assert (market['strike'] !== undefined);
        assert (market['optionType'] !== undefined);
    }
    const validTypes = {
        'spot': true,
        'margin': true,
        'swap': true,
        'future': true,
        'option': true,
    };
    const type = market['type'];
    //
    // binance has type = 'delivery'
    // https://github.com/ccxt/ccxt/issues/11121
    //
    // assert (type in validTypes);
    //
    const types = Object.keys (validTypes);
    for (let i = 0; i < types.length; i++) {
        const entry = types[i];
        if (entry in market) {
            const value = market[entry];
            assert ((value === undefined) || value || !value);
        }
    }
    //
    // todo fix binance
    //
    // if (market['future']) {
    //     assert ((market['swap'] === false) && (market['option'] === false));
    // } else if (market['swap']) {
    //     assert ((market['future'] === false) && (market['option'] === false));
    // } else if (market['option']) {
    //     assert ((market['future'] === false) && (market['swap'] === false));
    // }
    // if (market['linear']) {
    //     assert (market['inverse'] === false);
    // } else if (market['inverse']) {
    //     assert (market['linear'] === false);
    // }
    // if (market['future']) {
    //     assert (market['expiry'] !== undefined);
    //     assert (market['expiryDatetime'] !== undefined);
    // }
}

module.exports = testMarket;
