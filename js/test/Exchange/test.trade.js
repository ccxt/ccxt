'use strict';

const assert = require ('assert');

function testTrade (exchange, trade, symbol, now) {
    assert (trade);
    const sampleTrade = {
        'info': { 'a': 1, 'b': 2, 'c': 3 },    // the original decoded JSON as is
        'id': '12345-67890:09876/54321',       // string trade id
        'timestamp': 1502962946216,            // Unix timestamp in milliseconds
        'datetime': '2017-08-17 12:42:48.000', // ISO8601 datetime with milliseconds
        'symbol': 'ETH/BTC',                   // symbol
        'order': '12345-67890:09876/54321',    // string order id or undefined/None/null
        'type': 'limit',                       // order type, 'market', 'limit' or undefined/None/null
        'side': 'buy',                         // direction of the trade, 'buy' or 'sell'
        'takerOrMaker': 'taker',               // string, 'taker' or 'maker'
        'price': 0.06917684,                   // float price in quote currency
        'amount': 1.5,                         // amount of base currency
        'cost': 0.10376526,                    // total cost (including fees), `price * amount`
    };
    const keys = Object.keys (sampleTrade);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        assert (key in trade);
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
    const id = trade['id'];
    assert ((id === undefined) || (typeof id === 'string'));
    const timestamp = trade['timestamp'];
    assert (typeof timestamp === 'number' || timestamp === undefined);
    if (timestamp) {
        assert (timestamp > 1230940800000); // 03 Jan 2009 - first block
        assert (timestamp < 2147483648000); // 19 Jan 2038 - int32 overflows
        const adjustedNow = now + 60000;
        assert (timestamp < adjustedNow, 'trade.timestamp is greater than or equal to current time: trade: ' + exchange.iso8601 (timestamp) + ' now: ' + exchange.iso8601 (now));
    }
    assert (trade['datetime'] === exchange.iso8601 (timestamp));
    assert (trade['symbol'] === symbol, 'trade symbol is not equal to requested symbol: trade: ' + trade['symbol'] + ' requested: ' + symbol);
    assert (trade['type'] === undefined || typeof trade['type'] === 'string');
    assert (trade['side'] === undefined || trade['side'] === 'buy' || trade['side'] === 'sell', 'unexpected trade side ' + trade['side']);
    assert (trade['order'] === undefined || typeof trade['order'] === 'string');
    assert (typeof trade['price'] === 'number', 'trade.price is not a number');
    assert (trade['price'] > 0);
    assert (typeof trade['amount'] === 'number', 'trade.amount is not a number');
    assert (trade['amount'] >= 0);
    assert (trade['cost'] === undefined || typeof trade['cost'] === 'number', 'trade.cost is not a number');
    assert (trade['cost'] === undefined || trade['cost'] >= 0);
    const takerOrMaker = trade['takerOrMaker'];
    assert (takerOrMaker === undefined || takerOrMaker === 'taker' || takerOrMaker === 'maker');
}

module.exports = testTrade;
