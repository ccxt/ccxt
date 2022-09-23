'use strict'

const assert = require ('assert');
const testCommonItems = require ('./test.commonItems.js');

function testOrderBook (exchange, orderbook, method, symbol) {

    const format = {
        // 'symbol': 'ETH/BTC', // reserved
        'bids': [
            [ exchange.parseNumber ('1.23'), exchange.parseNumber ('0.123')],
            [ exchange.parseNumber ('1.22'), exchange.parseNumber ('0.543')],
        ],
        'asks': [
            [ exchange.parseNumber ('1.24'), exchange.parseNumber ('0.453')],
            [ exchange.parseNumber ('1.25'), exchange.parseNumber ('0.157')],
        ],
        'timestamp': 1504224000000,
        'datetime': '2017-09-01T00:00:00',
        'nonce': 134234234,
        // 'info': {},
    };
    testCommonItems.testStructureKeys (exchange, method, orderbook, format);
    testCommonItems.testCommonTimestamp (exchange, method, orderbook);

    const logText = ' <<< ' + exchange.id + ' ' + method + ' ::: ' + exchange.json (orderbook) + ' >>> ';

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
        assert (bids[0][0] <= asks[0][0], 'incorrect length of items; bids[0][0]:' + bids[0][0] + 'of' + bidsLength + 'asks[0][0]:' + asks[0][0] + 'of' + asksLength + logText);
    }
}

module.exports = testOrderBook;