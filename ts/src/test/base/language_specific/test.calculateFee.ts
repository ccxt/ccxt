// @ts-nocheck
// todo: per https://github.com/ttodua/ccxt/blob/428f5b50da50b7401caa5ac452538fb0f6641af4/ts/src/test/base/test.calculateFee.ts

import assert, { strictEqual, deepEqual } from 'assert';
import ccxt, { Exchange, functions } from '../../../../ccxt.js';

const { index, aggregate, unCamelCase } = functions;

const equal = strictEqual;

function testCalculateFee () {
    const price  = 100.00;
    const amount = 10.00;
    const taker  = 0.0025;
    const maker  = 0.0010;
    const fees   = { taker, maker };
    const market = {
        'id':     'foobar',
        'symbol': 'FOO/BAR',
        'base':   'FOO',
        'quote':  'BAR',
        'taker':   taker,
        'maker':   maker,
        'spot': true,
        'precision': {
            'amount': 0.00000001,
            'price': 0.00000001,
        },
    };

    const exchange = new Exchange ({
        'id': 'mock',
        'markets': {
            'FOO/BAR': market,
        },
    });

    Object.keys (fees).forEach ((takerOrMaker) => {

        const result = exchange.calculateFee (market['symbol'], 'limit', 'sell', amount, price, takerOrMaker, {});

        deepEqual (result, {
            'type': takerOrMaker,
            'currency': 'BAR',
            'rate': fees[takerOrMaker],
            'cost': fees[takerOrMaker] * amount * price,
        });
    });
}

export default testCalculateFee;
