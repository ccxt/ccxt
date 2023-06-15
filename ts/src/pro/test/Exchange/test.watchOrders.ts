'use strict';

// ----------------------------------------------------------------------------

import assert from 'assert';
import testOrder from '../../../test/Exchange/base/test.order.js';
import errors from '../../../base/errors.js';

/*  ------------------------------------------------------------------------ */

export default async (exchange, symbol) => {

    // log (symbol.green, 'watching orders...')

    const method = 'watchOrders';
    const skippedProperties = {};

    if (!exchange.has[method]) {
        console.log (exchange.id, 'does not support', method + '() method');
        return;
    }

    let response = undefined;

    let now = Date.now ();
    const ends = now + 10000;

    while (now < ends) {

        try {

            response = await exchange[method] (symbol);

            now = Date.now ();

            assert (response instanceof Array);

            console.log (exchange.iso8601 (now), exchange.id, symbol.green, method, (Object.values (response).length.toString () as any).green, 'orders');

            // log.noLocate (asTable (response))

            for (let i = 0; i < response.length; i++) {
                const order = response[i];
                testOrder (exchange, skippedProperties, method, order, symbol, now);
            }
        } catch (e) {

            if (!(e instanceof errors.NetworkError)) {
                throw e;
            }

            now = Date.now ();
        }
    }

    const response1 = {
        "instrument": "PI_XBTUSD",
        "time": 1567702877410,
        "last_update_time": 1567702877410,
        "qty": 304.0,
        "filled": 0.0,
        "limit_price": 10640.0,
        "stop_price": 0.0,
        "type": "limit",
        "order_id": "59302619-41d2-4f0b-941f-7e7914760ad3",
        "direction": 1,
        "reduce_only": true
    };

    const response2 = {
        "instrument": "PI_XBTUSD",
        "time": 1567702877410,
        "last_update_time": 1567702877410,
        "qty": 304.0,
        "filled": 20.0,
        "limit_price": 10640.0,
        "stop_price": 0.0,
        "type": "limit",
        "order_id": "59302619-41d2-4f0b-941f-7e7914760ad3",
        "direction": 1,
        "reduce_only": true
    };

    const response3 = {
        "instrument": "PI_XBTUSD",
        "time": 1567702877410,
        "last_update_time": 1567702877410,
        "qty": 304.0,
        "filled": 30.0,
        "limit_price": 10640.0,
        "stop_price": 0.0,
        "type": "limit",
        "order_id": "59302619-41d2-4f0b-941f-7e7914760ad3",
        "direction": 1,
        "reduce_only": true
    };

    const order1 = exchange.parseWsOrder (response1);

    const parsedOrder1 = exchange.handlePreviousOrder (response1, 'BTC/USD:BTC');
    exchange.orders.append (parsedOrder1);
    assert (parsedOrder1 === order1);

    const trades = [
        {
            'info': {
                'instrument': 'PI_XBTUSD',
                'time': 1567702877410,
                'last_update_time': 1567702877410,
                'qty': 304,
                'filled': 20,
                'limit_price': 10640,
                'stop_price': 0,
                'type': 'limit',
                'order_id': '59302619-41d2-4f0b-941f-7e7914760ad3',
                'direction': 1,
                'reduce_only': true
            },
            'id': undefined,
            'symbol': 'BTC/USD:BTC',
            'timestamp': 1567702877410,
            'datetime': '2019-09-05T17:01:17.410Z',
            'order': undefined,
            'type': 'limit',
            'side': 'sell',
            'takerOrMaker': undefined,
            'price': 10640,
            'amount': 20,
            'cost': 212800,
            'fee': { 'rate': undefined, 'cost': undefined, 'currency': undefined },
            'fees': [ { 'rate': undefined, 'cost': undefined, 'currency': undefined } ]
        },
        {
            'info': {
                'instrument': 'PI_XBTUSD',
                'time': 1567702877410,
                'last_update_time': 1567702877410,
                'qty': 304,
                'filled': 30,
                'limit_price': 10640,
                'stop_price': 0,
                'type': 'limit',
                'order_id': '59302619-41d2-4f0b-941f-7e7914760ad3',
                'direction': 1,
                'reduce_only': true
            },
            'id': undefined,
            'symbol': 'BTC/USD:BTC',
            'timestamp': 1567702877410,
            'datetime': '2019-09-05T17:01:17.410Z',
            'order': undefined,
            'type': 'limit',
            'side': 'sell',
            'takerOrMaker': undefined,
            'price': 10640,
            'amount': 10,
            'cost': 106400,
            'fee': { 'rate': undefined, 'cost': undefined, 'currency': undefined },
            'fees': [ { 'rate': undefined, 'cost': undefined, 'currency': undefined } ]
        }
    ];
    const parsedOrder2 = exchange.handlePreviousOrder (response2, 'BTC/USD:BTC');
    exchange.orders.append (parsedOrder2);
    const parsedOrder3 = exchange.handlePreviousOrder (response3, 'BTC/USD:BTC');
    assert (trades === parsedOrder3['trades']);

    return response;
};
