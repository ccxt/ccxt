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

    const order1 = {
        'id':                 '59302619-41d2-4f0b-941f-7e7914760ad3',
        'clientOrderId':      undefined,
        'datetime':           '2019-09-5 11:01:17.000',
        'timestamp':          1567702877410,
        'lastTradeTimestamp': 1502962956216,
        'status':             'open',
        'symbol':             'BTC/USD:BTC',
        'type':               'limit',
        'timeInForce':        undefined,
        'side':               'buy',
        'price':              10640.0,
        'average':            undefined,
        'amount':             304.0,
        'filled':             0.0,
        'remaining':          304.0,
        'cost':               undefined,
        'trades':             [
            // {...}
        ],
        'fee': undefined,
        'info': {},
    };

    // exchange.orders.hashmap['BTC/USDT'] = {
    //     '59302619-41d2-4f0b-941f-7e7914760ad3': order1,
    // };

    const parsedOrder = exchange.handleOrderPreviousOrder (response1, exchange.orders, 'BTC/USD:BTC');
    assert (parsedOrder === order1);

    exchange.orders.append (order1);
    const parsedOrder2 = exchange.handleOrderPreviousOrder (response2, exchange.orders, 'BTC/USD:BTC');
    const trade = {

    };
    const parsedOrderTrades = parsedOrder2['trades'];
    assert (parsedOrderTrades[0] === trade);

    return response;
};
