'use strict';

const assert = require ('assert');
const testCommonItems = require ('./test.commonItems.js');

function testTrade (exchange, trade, symbol, now) {
    const method = 'trade';
    const format = {
        'info': { 'a': 1, 'b': 2, 'c': 3 }, // the original decoded JSON as is
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
    testCommonItems.testStructureKeys (exchange, method, trade, format);
    testCommonItems.testId (exchange, method, trade);
    testCommonItems.testCommonTimestamp (exchange, method, trade, now);
    const logText = testCommonItems.logTemplate (exchange, method, trade);
    //
    const fee = exchange.safeValue (trade, 'fee');
    const fees = exchange.safeValue (trade, 'fees');
    // logical XOR
    // doesn't work when both fee is defined and fees is defined
    // if (fee || fees) {
    //     assert (!(fee && fees));
    // }
    if (fee) {
        assert ('cost' in fee, '"fee" does not contain "cost" key' + logText);
        assert ('currency' in fee, '"fee" does not contain "currency" key' +  logText);
    }
    if (fees) {
        assert (Array.isArray (fees), '"fees" is not an array' +  logText);
        for (let i = 0; i < fees.length; i++) {
            const fee = fees[i];
            assert ('cost' in fee, '"fee" does not contain "cost" key' + logText);
            assert ('currency' in fee, '"fee" does not contain "currency" key' + logText);
        }
    }
    assert (trade['symbol'] === symbol, 'trade symbol: ' + trade['symbol'] + ' is not requested symbol: ' + symbol + logText);
    assert ((trade['side'] === undefined) || exchange.inArray (trade['side'], [ 'buy', 'sell' ]), 'trade side: ' + trade['side'] + ' is not undefined, buy or sell' + logText);
    assert ((typeof trade['order'] === 'undefined') || (typeof trade['order'] === 'string'), 'trade order: ' + trade['order'] + ' is not undefined or string' + logText);
    assert (typeof trade['price'] === 'number', 'trade price: ' + trade['price'] + ' is not a number' + logText);
    assert (trade['price'] > 0, 'trade price: ' + trade['price'] + ' is not greater than zero' + logText);
    assert (typeof trade['amount'] === 'number', 'trade amount: ' + trade['amount'] + ' is not a number' + logText);
    assert (trade['amount'] >= 0, 'trade amount: ' + trade['amount'] + ' is not >= zero' + logText);
    assert ((typeof trade['cost'] === 'undefined') || (typeof trade['cost'] === 'number'), 'trade cost: ' + trade['cost'] + ' is not undefined or number' + logText);
    assert ((trade['cost'] === undefined) || (trade['cost'] >= 0), 'trade cost: ' + trade['cost'] + ' is neither undefined, nor >= zero' + logText);
    assert ((trade['takerOrMaker'] === undefined) || exchange.inArray (trade['takerOrMaker'], [ 'taker', 'maker' ]), 'trade takerOrMaker: ' + trade['takerOrMaker'] + ' is not undefined, taker or maker' + logText);
}

module.exports = testTrade;
