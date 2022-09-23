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
        'type': 'limit', // order type, 'market', 'limit' or undefined/None/null
        'side': 'buy', // direction of the trade, 'buy' or 'sell'
        'takerOrMaker': 'taker', // string, 'taker' or 'maker'
        'price': exchange.parseNumber ('0.06917684'), // float price in quote currency
        'amount': exchange.parseNumber ('1.5'), // amount of base currency
        'cost': exchange.parseNumber ('0.10376526'), // total cost (including fees), `price * amount`
    };
    testCommonItems.testStructureKeys (exchange, method, trade, format);
    testCommonItems.testId (exchange, method, trade);
    testCommonItems.testCommonTimestamp (exchange, method, trade);

    const logText = ' <<< ' + exchange.id + ' ' + method + ' ::: ' + exchange.json (trade) + ' >>> ';

    const timestamp = trade['timestamp'];
    if (timestamp) {
        const adjustedNow = now + 60000;
        assert (timestamp < adjustedNow, 'timestamp is greater than or equal to current time: trade: ' + exchange.iso8601 (timestamp) + ' now: ' + exchange.iso8601 (now) + logText);
    }

    const fee = ('fee' in trade) ? trade['fee'] : undefined;
    const fees = ('fees' in trade) ? trade['fees'] : undefined;
    // logical XOR
    // doesn't work when both fee is defined and fees is defined
    // if (fee || fees) {
    //     assert (!(fee && fees));
    // }
    if (fee) {
        assert (('cost' in fee) && ('currency' in fee));
    }
    if (fees) {
        assert (Array.isArray (fees));
        for (let i = 0; i < fees.length; i++) {
            const fee = fees[i];
            assert (('cost' in fee) && ('currency' in fee));
        }
    }

    assert (trade['symbol'] === symbol, 'symbol is not equal to requested symbol: trade: ' + trade['symbol'] + ' requested: ' + symbol + logText);
    assert ((trade['type'] === undefined) || (typeof trade['type'] === 'string'));
    assert ((trade['side'] === undefined) || (trade['side'] === 'buy') || (trade['side'] === 'sell'), 'unexpected trade side ' + trade['side'] + logText);
    assert ((trade['order'] === undefined) || (typeof trade['order'] === 'string'));
    assert (typeof trade['price'] === 'number', 'price is not a number');
    assert (trade['price'] > 0);
    assert (typeof trade['amount'] === 'number', 'amount is not a number' + logText);
    assert (trade['amount'] >= 0);
    assert ((trade['cost'] === undefined) || (typeof trade['cost'] === 'number'), 'cost is not a number' + logText);
    assert ((trade['cost'] === undefined) || (trade['cost'] >= 0));
    const takerOrMaker = trade['takerOrMaker'];
    assert ((takerOrMaker === undefined) || (takerOrMaker === 'taker') || (takerOrMaker === 'maker'));
}

module.exports = testTrade;
