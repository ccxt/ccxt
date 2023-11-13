'use strict';

// ----------------------------------------------------------------------------

import assert from 'assert';
import { iso8601 } from '../../../base/functions.js';
import errors from '../../../base/errors.js';

/*  ------------------------------------------------------------------------ */

export default async (exchange) => {

    let response = undefined;
    let now = Date.now ();
    let symbol = undefined;
    const method = 'handlePreviousOrder';

    try {
        if (exchange.id === 'krakenfutures') {

            symbol = 'BTC/USD:BTC';

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
            now = Date.now ();
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
            response = exchange.handlePreviousOrder (response3, 'BTC/USD:BTC');
            now = Date.now ();
            assert (trades === response['trades']);
        } else if (exchange.id === 'hitbtc3') {

            symbol = 'USDT/USDC';

            const response1 = {
                'id': 1089241146910,
                'client_order_id': 'cY5C79g9SpWHrnZ_FBmanFE3pcCumpnA',
                'symbol': 'USDTUSDC',
                'side': 'buy',
                'status': 'new',
                'type': 'limit',
                'time_in_force': 'GTC',
                'quantity': '3',
                'quantity_cumulative': '0',
                'price': '0.99000000',
                'post_only': false,
                'created_at': '2023-06-15T05:58:43.95Z',
                'updated_at': '2023-06-15T05:58:43.95Z',
                'report_type': 'status',
            };

            const response2 = {
                'id': 1089241146910,
                'client_order_id': 'cY5C79g9SpWHrnZ_FBmanFE3pcCumpnA',
                'symbol': 'USDTUSDC',
                'side': 'buy',
                'status': 'new',
                'type': 'limit',
                'time_in_force': 'GTC',
                'quantity': '3',
                'quantity_cumulative': '0',
                'price': '0.99000000',
                'post_only': false,
                'created_at': '2023-06-15T05:58:43.95Z',
                'updated_at': '2023-06-15T05:58:43.95Z',
                'trade_id': 1361977606,
                'trade_quantity': '1',
                'trade_price': '0.99',
                'trade_fee': '0.001',
                'trade_taker': true,
                'trade_position_id': 485308,
                'report_type': 'new',
            };

            const response3 = {
                'id': 1089241146911,
                'client_order_id': 'cY5C79g9SpWHrnZ_FBmanFE3pcCumpnA',
                'symbol': 'USDTUSDC',
                'side': 'buy',
                'status': 'new',
                'type': 'limit',
                'time_in_force': 'GTC',
                'quantity': '3',
                'quantity_cumulative': '0',
                'price': '0.99000000',
                'post_only': false,
                'created_at': '2023-06-15T05:58:43.95Z',
                'updated_at': '2023-06-15T05:58:43.95Z',
                'trade_id': 1361977606,
                'trade_quantity': '1',
                'trade_price': '0.99',
                'trade_fee': '0.001',
                'trade_taker': true,
                'trade_position_id': 485309,
                'report_type': 'new',
            };

            const order1 = exchange.parseWsOrder (response1);
            const parsedOrder1 = exchange.handlePreviousOrder (response1, 'USDT/USDC');
            exchange.orders.append (parsedOrder1);
            now = Date.now ();
            assert (parsedOrder1 === order1);

            const trades = [
                {
                    'info': {
                        'id': 1089241146910,
                        'client_order_id': 'cY5C79g9SpWHrnZ_FBmanFE3pcCumpnA',
                        'symbol': 'USDTUSDC',
                        'side': 'buy',
                        'status': 'new',
                        'type': 'limit',
                        'time_in_force': 'GTC',
                        'quantity': '3',
                        'quantity_cumulative': '0',
                        'price': '0.99000000',
                        'post_only': false,
                        'created_at': '2023-06-15T05:58:43.95Z',
                        'updated_at': '2023-06-15T05:58:43.95Z',
                        'trade_id': 1361977606,
                        'trade_quantity': '1',
                        'trade_price': '0.99',
                        'trade_fee': '0.001',
                        'trade_taker': true,
                        'trade_position_id': 485308,
                        'report_type': 'new'
                    },
                    'id': '1361977606',
                    'order': '1089241146910',
                    'timestamp': undefined,
                    'datetime': undefined,
                    'symbol': 'USDT/USDC',
                    'type': undefined,
                    'side': 'buy',
                    'takerOrMaker': 'taker',
                    'price': 0.99,
                    'amount': 1,
                    'cost': 0.99,
                    'fee': { 'cost': 0.001, 'currency': undefined, 'rate': undefined },
                    'fees': [ { 'cost': 0.001, 'currency': undefined, 'rate': undefined } ]
                },
                {
                    'info': {
                        'id': 1089241146911,
                        'client_order_id': 'cY5C79g9SpWHrnZ_FBmanFE3pcCumpnA',
                        'symbol': 'USDTUSDC',
                        'side': 'buy',
                        'status': 'new',
                        'type': 'limit',
                        'time_in_force': 'GTC',
                        'quantity': '3',
                        'quantity_cumulative': '0',
                        'price': '0.99000000',
                        'post_only': false,
                        'created_at': '2023-06-15T05:58:43.95Z',
                        'updated_at': '2023-06-15T05:58:43.95Z',
                        'trade_id': 1361977606,
                        'trade_quantity': '1',
                        'trade_price': '0.99',
                        'trade_fee': '0.001',
                        'trade_taker': true,
                        'trade_position_id': 485309,
                        'report_type': 'new'
                    },
                    'id': '1361977606',
                    'order': '1089241146911',
                    'timestamp': undefined,
                    'datetime': undefined,
                    'symbol': 'USDT/USDC',
                    'type': undefined,
                    'side': 'buy',
                    'takerOrMaker': 'taker',
                    'price': 0.99,
                    'amount': 1,
                    'cost': 0.99,
                    'fee': { 'cost': 0.001, 'currency': undefined, 'rate': undefined },
                    'fees': [ { 'cost': 0.001, 'currency': undefined, 'rate': undefined } ]
                }
            ];
            const parsedOrder2 = exchange.handlePreviousOrder (response2, 'USDT/USDC');
            exchange.orders.append (parsedOrder2);
            response = exchange.handlePreviousOrder (response3, 'USDT/USDC');
            now = Date.now ();
            assert (trades === response['trades']);
            assert (response['average'] === 0.99);
            assert (response['remaining'] === 1);
            assert (response['fee']['cost'] === 0.002);
        }
        console.log (iso8601 (now), exchange.id, symbol.green, method, (Object.values (response).length.toString () as any).green, 'orders');
    } catch (e) {

        if (!(e instanceof errors.NetworkError)) {
            throw e;
        }

        now = Date.now ();
    }

    return response;
};
