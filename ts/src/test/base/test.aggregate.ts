// @ts-nocheck

import assert, { strictEqual, deepEqual } from 'assert';
import ccxt, { Exchange, functions } from '../../../ccxt.js';

const { index, aggregate, unCamelCase } = functions;

const equal = strictEqual;


function testAggregate () {

    const bids = [
        [ 789.1, 123.0 ],
        [ 789.100, 123.0 ],
        [ 123.0, 456.0 ],
        [ 789.0, 123.0 ],
        [ 789.10, 123.0 ],
    ];

    const asks = [
        [ 123.0, 456.0 ],
        [ 789.0, 123.0 ],
        [ 789.10, 123.0 ],
    ];

    deepEqual (aggregate (bids.sort ()), [
        [ 123.0, 456.0 ],
        [ 789.0, 123.0 ],
        [ 789.1, 369.0 ],
    ]);

    deepEqual (aggregate (asks.sort ()), [
        [ 123.0, 456.0 ],
        [ 789.0, 123.0 ],
        [ 789.10, 123.0 ],
    ]);

    deepEqual (aggregate ([]), []);
}

export default testAggregate;
