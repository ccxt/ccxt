'use strict'

const assert = require ('assert');
const testCommonItems = require ('./test.commonItems.js');

function testOrderBook (exchange, orderbook, method, symbol) {

    const msgPrefix = exchange.id + ' ' + method + ' : ';

    const format = {
        // 'symbol': 'ETH/BTC', // reserved
        'bids': [],
        'asks': [],
        'timestamp': 1234567890,
        'datetime': '2017-09-01T00:00:00',
        'nonce': 134234234,
        // 'info': {},
    };

    const keys = Object.keys (format);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        assert (key in orderbook, msgPrefix + key + ' is missing from structure.');
    }

    const bids = orderbook['bids'];
    const asks = orderbook['asks'];

    const bidsLength = bids.length;
    for (let i = 0; i < bidsLength; i++) {
        if (bidsLength > (i + 1)) {
            assert (bids[i][0] >= bids[i + 1][0]);
        }
        assert (typeof bids[i][0] === 'number');
        assert (typeof bids[i][1] === 'number');
    }

    const asksLength = asks.length;
    for (let i = 0; i < asksLength; i++) {
        if (asksLength > (i + 1)) {
            assert (asks[i][0] <= asks[i + 1][0]);
        }
        assert (typeof asks[i][0] === 'number');
        assert (typeof asks[i][1] === 'number');
    }

    const skippedExchanges = [
        'bitrue',
        'bkex',
        'blockchaincom',
        'btcalpha',
        'btcbox',
        'ftxus',
        'mexc',
        'xbtce',
        'upbit', // an orderbook might have a 0-price ask occasionally
    ];

    if (exchange.inArray (exchange.id, skippedExchanges)) {
        return;
    }

    if (bidsLength && asksLength) {
        assert (bids[0][0] <= asks[0][0], 'bids[0][0]:' + bids[0][0] + 'of' + bidsLength + 'asks[0][0]:' + asks[0][0] + 'of' + asksLength);
    }

    testCommonItems (exchange, method, orderbook, 'timestamp');
}

module.exports = testOrderBook;