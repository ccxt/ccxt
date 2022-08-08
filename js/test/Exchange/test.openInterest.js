'use strict'

// ----------------------------------------------------------------------------

const assert = require ('assert');

// ----------------------------------------------------------------------------


module.exports = (exchange, openInterest, method) => {
    const format = {
        symbol: 'BTC/USDT',
        baseVolume: 81094.084,
        quoteVolume: 3544581864.598,
        timestamp: 1649373600000,
        datetime: '2022-04-07T23:20:00.000Z',
        info: {},
    };
    const keys = Object.keys (format);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        assert (key in openInterest);
    }
    console.log (openInterest['datetime'], exchange.id, method, openInterest['symbol'], openInterest['quoteVolume'], openInterest['baseVolume']);
    if (openInterest['quoteVolume'] !== undefined) {
        assert (typeof openInterest['quoteVolume'] === 'number');
        assert (openInterest['quoteVolume'] > 0);
    }
    if (openInterest['baseVolume'] !== undefined) {
        assert (typeof openInterest['baseVolume'] === 'number');
        assert (openInterest['baseVolume'] > 0);
    }
    if (openInterest['timestamp'] !== undefined) {
        assert (typeof openInterest['timestamp'] === 'number');
        assert (openInterest['timestamp'] > 1199145600000); // Timestamp for Jan 1 2008
        assert (openInterest['timestamp'] < 7258118400000); // Timestamp for Jan 1 2200
    }
    assert (typeof openInterest['symbol'] === 'string' || openInterest['symbol'] === undefined);
    assert (typeof openInterest['datetime'] === 'string' || openInterest['datetime'] === undefined);
    return openInterest;
}
