'use strict';

const sharedMethods = require ('./test.sharedMethods.js');

function testTrade (exchange, method, entry, symbol, now) {
    const format = {
        'info': { },
        'id': '12345-67890:09876/54321', // string trade id
        'timestamp': 1502962946216, // Unix timestamp in milliseconds
        'datetime': '2017-08-17 12:42:48.000', // ISO8601 datetime with milliseconds
        'symbol': 'ETH/BTC', // symbol
        'order': '12345-67890:09876/54321', // string order id or undefined/None/null
        'side': 'buy', // direction of the trade, 'buy' or 'sell'
        'takerOrMaker': 'taker', // string, 'taker' or 'maker'
        'price': exchange.parseNumber ('0.06917684'), // float price in quote currency
        'amount': exchange.parseNumber ('1.5'), // amount of base currency
        'cost': exchange.parseNumber ('0.10376526'), // total cost (including fees), `price * amount`
    };
    const emptyNotAllowedFor = [ 'side', 'takerOrMaker', 'price', 'amount', 'cost' ];
    sharedMethods.reviseStructureKeys (exchange, method, entry, format, emptyNotAllowedFor);
    sharedMethods.reviseCommonTimestamp (exchange, method, entry, now);
    sharedMethods.reviseSymbol (exchange, method, entry, entry['symbol'], symbol);
    //
    sharedMethods.reviseAgainstArray (exchange, method, entry, 'side', [ 'buy', 'sell' ]);
    sharedMethods.reviseAgainstArray (exchange, method, entry, 'takerOrMaker', [ 'taker', 'maker' ]);
    sharedMethods.reviseFeeObject (exchange, method, entry['fee']);
    sharedMethods.reviseFeesObject (exchange, method, entry['fees']);
}

module.exports = testTrade;
