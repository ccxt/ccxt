'use strict';

const assert = require ('assert');
const testCommonItems = require ('./test.commonItems.js');

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
    testCommonItems.testStructureKeys (exchange, method, entry, format, emptyNotAllowedFor);
    testCommonItems.testCommonTimestamp (exchange, method, entry, now);
    testCommonItems.testSymbol (exchange, method, entry, entry['symbol'], symbol);
    const logText = testCommonItems.logTemplate (exchange, method, entry);
    //
    testCommonItems.checkAgainstArray (exchange, method, entry, 'side', [ 'buy', 'sell' ]);
    testCommonItems.checkAgainstArray (exchange, method, entry, 'takerOrMaker', [ 'taker', 'maker' ]);
    testCommonItems.checkFeeObject (exchange, method, entry['fee']);
    const fees = exchange.safeValue (entry, 'fees');
    if (fees) {
        assert (Array.isArray (fees), '"fees" is not an array' +  logText);
        for (let i = 0; i < fees.length; i++) {
            testCommonItems.checkFeeObject (exchange, method, fees[i]);
        }
    }
}

module.exports = testTrade;
