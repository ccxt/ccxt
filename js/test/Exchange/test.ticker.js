'use strict'

const assert = require ('assert');
const sharedMethods = require ('./test.commonItems.js');
const Precise = require ('../../base/Precise');

function testTicker (exchange, method, entry, symbol) {
    const format = {
        'info': {},
        'symbol': 'ETH/BTC',
        'timestamp': 1502962946216,
        'datetime': '2017-09-01T00:00:00',
        'high': exchange.parseNumber ('1.234'), // highest price
        'low': exchange.parseNumber ('1.234'), // lowest price
        'bid': exchange.parseNumber ('1.234'), // current best bid (buy) price
        'bidVolume': exchange.parseNumber ('1.234'), // current best bid (buy) amount (may be missing or undefined)
        'ask': exchange.parseNumber ('1.234'), // current best ask (sell) price
        'askVolume': exchange.parseNumber ('1.234'), // current best ask (sell) amount (may be missing or undefined)
        'vwap': exchange.parseNumber ('1.234'), // volume weighed average price
        'open': exchange.parseNumber ('1.234'), // opening price
        'close': exchange.parseNumber ('1.234'), // price of last trade (closing price for current period)
        'last': exchange.parseNumber ('1.234'), // same as `close`, duplicated for convenience
        'previousClose': exchange.parseNumber ('1.234'), // closing price for the previous period
        'change': exchange.parseNumber ('1.234'), // absolute change, `last - open`
        'percentage': exchange.parseNumber ('1.234'), // relative change, `(change/open) * 100`
        'average': exchange.parseNumber ('1.234'), // average price, `(last + open) / 2`
        'baseVolume': exchange.parseNumber ('1.234'), // volume of base currency
        'quoteVolume': exchange.parseNumber ('1.234'), // volume of quote currency
    };
    const emptyNotAllowedFor = [ 'close', 'amount', 'currency' ];
    sharedMethods.reviseStructureKeys (exchange, method, entry, format, emptyNotAllowedFor);
    sharedMethods.reviseCommonTimestamp (exchange, method, entry);
    const logText = sharedMethods.logTemplate (exchange, method, entry);
    //
    assert (!('first' in entry), '`first` field leftover' + logText);
    const lastString = exchange.safeString (entry, 'last');
    const closeString = exchange.safeString (entry, 'close');
    assert ((closeString === undefined && lastString === undefined) || Precise.stringEq (lastString, closeString), '`last` != `close`' + logText);
    //
    // const { high, low, vwap, baseVolume, quoteVolume } = entry
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
    const skippedExchanges = [];
    if (exchange.inArray (exchange.id, skippedExchanges)) { 
        return;
    }
    if (entry['bid'] && entry['ask']) {
        const symbolName = entry['symbol'] ? (entry['symbol'] + ' ') : '';
        assert (entry['bid'] <= entry['ask'], symbolName + ' bid is greater than ask!' + logText);
    }
    sharedMethods.reviseSymbol (exchange, method, entry, 'symbol', symbol);
}

module.exports = testTicker;