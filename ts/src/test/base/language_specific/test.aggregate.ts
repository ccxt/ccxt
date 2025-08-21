// @ts-nocheck
// todo: per https://github.com/ttodua/ccxt/blob/428f5b50da50b7401caa5ac452538fb0f6641af4/ts/src/test/base/test.aggregate.ts

import assert, { strictEqual, deepEqual } from 'assert';
import ccxt, { Exchange, functions } from '../../../../ccxt.js';

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
