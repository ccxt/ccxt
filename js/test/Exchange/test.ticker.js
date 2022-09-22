'use strict'

const assert = require ('assert');
const testCommonItems = require ('./test.commonItems.js');
const Precise = require ('../../base/Precise');

function testTicker (exchange, ticker, method, symbol) {

    const format = {
        'symbol':       'ETH/BTC',
        'info':          {},
        'timestamp':     1502962946216,
        'datetime':     '2017-09-01T00:00:00',
        'high':          1.234, // highest price
        'low':           1.234, // lowest price
        'bid':           1.234, // current best bid (buy) price
        'bidVolume':     1.234, // current best bid (buy) amount (may be missing or undefined)
        'ask':           1.234, // current best ask (sell) price
        'askVolume':     1.234, // current best ask (sell) amount (may be missing or undefined)
        'vwap':          1.234, // volume weighed average price
        'open':          1.234, // opening price
        'close':         1.234, // price of last trade (closing price for current period)
        'last':          1.234, // same as `close`, duplicated for convenience
        'previousClose': 1.234, // closing price for the previous period
        'change':        1.234, // absolute change, `last - open`
        'percentage':    1.234, // relative change, `(change/open) * 100`
        'average':       1.234, // average price, `(last + open) / 2`
        'baseVolume':    1.234, // volume of base currency
        'quoteVolume':   1.234, // volume of quote currency
    };
    testCommonItems.testStructureKeys (exchange, method, ticker, format);
    testCommonItems.testCommonTimestamp (exchange, method, ticker);
    testCommonItems.testInfo (exchange, method, ticker, 'object');

    const logText = ' <<< ' + exchange.id + ' ' + method + ' ::: ' + exchange.json (ticker) + ' >>> ';

    assert (!('first' in ticker), '`first` field leftover' + logText);
    const lastString = exchange.safeString (ticker, 'last');
    const closeString = exchange.safeString (ticker, 'close');
    assert (Precise.stringEq (lastString, closeString), '`last` != `close`' + logText);

    // const { high, low, vwap, baseVolume, quoteVolume } = ticker
    // this assert breaks QuadrigaCX sometimes... still investigating
    // if (vwap) {
    //     assert (vwap >= low && vwap <= high)
    // }
    // if (baseVolume && quoteVolume && high && low) {
    //     assert (quoteVolume >= baseVolume * low) // this assertion breaks therock
    //     assert (quoteVolume <= baseVolume * high)
    // }
    // if (baseVolume && vwap) {
    //     assert (quoteVolume)
    // }
    // if (quoteVolume && vwap) {
    //     assert (baseVolume)
    // }

    const skippedExchanges = [
        'bigone',
        'bitmart',
        'bitrue',
        'btcbox',
        'btcturk',
        'bybit',
        'coss',
        'cryptocom',
        'ftx',
        'ftxus',
        'gateio', // some ticker bids are greaters than asks
        'idex',
        'mercado',
        'mexc',
        'okex',
        'poloniex',
        'qtrade',
        'southxchange', // https://user-images.githubusercontent.com/1294454/59953532-314bea80-9489-11e9-85b3-2a711ca49aa7.png
        'timex',
        'xbtce',
    ];

    if (exchange.inArray (exchange.id, skippedExchanges)) { 
        return;
    }

    if (ticker['baseVolume'] || ticker['quoteVolume']) {
        if (ticker['bid'] && ticker['ask']) {
            const symbolName = ticker['symbol'] ? (ticker['symbol'] + ' ') : '';
            assert (ticker['bid'] <= ticker['ask'], symbolName + ' ticker bid is greater than ticker ask!' + logText);
        }
    }

    return ticker;
}

module.exports = testTicker;