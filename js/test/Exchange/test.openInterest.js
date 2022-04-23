'use strict'

// ----------------------------------------------------------------------------

const assert = require ('assert');

// ----------------------------------------------------------------------------


module.exports = (exchange, openInterest, method) => {
    const format = {
        symbol: 'BTC/USDT',
        volume: 81094.084,
        value: 3544581864.598,
        timestamp: 1649373600000,
        datetime: '2022-04-07T23:20:00.000Z',
        info: {},
    };
    const keys = Object.keys (format);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        assert (key in openInterest);
    }
    console.log (openInterest['datetime'], exchange.id, method, openInterest['symbol'], openInterest['value'], openInterest['volume']);
    if (openInterest['value'] !== undefined) {
        assert (typeof openInterest['value'] === 'number');
        assert (openInterest['value'] > 0);
    }
    if (openInterest['volume'] !== undefined) {
        assert (typeof openInterest['volume'] === 'number');
        assert (openInterest['volume'] > 0);
    }
    if (openInterest['timestamp'] !== undefined) {
        assert (typeof openInterest['timestamp'] === 'number');
        assert (openInterest['timestamp'] > 1199145600000); // Timestamp for Jan 1 2008
    }
    assert (typeof openInterest['symbol'] === 'string' || typeof openInterest['symbol'] === undefined);
    assert (typeof openInterest['datetime'] === 'string' || typeof openInterest['datetime'] === undefined);
    return openInterest;
}
