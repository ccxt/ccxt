import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shapeResult } from '../../ts/shape.js';
import { ArgError } from '../../ts/tools/common.js';

// symbol-keyed map, like fetchFundingRates / fetchTickers
const rates: Record<string, any> = {
    'A/USDT:USDT': { 'symbol': 'A/USDT:USDT', 'fundingRate': 0.0001, 'nextFundingDatetime': '2026-11-08T16:00:00.000Z', 'markPrice': 1 },
    'B/USDT:USDT': { 'symbol': 'B/USDT:USDT', 'fundingRate': -0.003, 'nextFundingDatetime': '2026-11-08T16:00:00.000Z', 'markPrice': 2 },
    'C/USDT:USDT': { 'symbol': 'C/USDT:USDT', 'fundingRate': undefined, 'nextFundingDatetime': undefined, 'markPrice': 3 },
    'D/USDT:USDT': { 'symbol': 'D/USDT:USDT', 'fundingRate': 0.002, 'nextFundingDatetime': '2026-11-08T16:00:00.000Z', 'markPrice': 4 },
};

test ('no options leaves the result untouched', () => {
    const shaped = shapeResult (rates, {});
    assert.equal (shaped.data, rates);
    assert.deepEqual (shaped.meta, {});
});

test ('sortBy descending + limit on a symbol-keyed map keeps keys, order and reports totals', () => {
    const shaped = shapeResult (rates, { 'sortBy': '-fundingRate', 'limit': 2 });
    assert.deepEqual (Object.keys (shaped.data), [ 'D/USDT:USDT', 'A/USDT:USDT' ]);
    assert.equal (shaped.meta.total, 4);
    assert.equal (shaped.meta.returned, 2);
    assert.equal (shaped.meta.hasMore, true);
    assert.equal (shaped.meta.sortedBy, '-fundingRate');
});

test ('ascending sort puts entries missing the field last', () => {
    const shaped = shapeResult (rates, { 'sortBy': 'fundingRate' });
    assert.deepEqual (Object.keys (shaped.data), [ 'B/USDT:USDT', 'A/USDT:USDT', 'D/USDT:USDT', 'C/USDT:USDT' ]);
    assert.equal (shaped.meta.hasMore, undefined);
    const descending = shapeResult (rates, { 'sortBy': '-fundingRate' });
    assert.deepEqual (Object.keys (descending.data).pop (), 'C/USDT:USDT', 'missing values sink in both directions');
});

test ('fields projects each entry of a map', () => {
    const shaped = shapeResult (rates, { 'fields': [ 'fundingRate' ], 'sortBy': 'fundingRate', 'limit': 1 });
    assert.deepEqual (shaped.data, { 'B/USDT:USDT': { 'fundingRate': -0.003 } });
});

test ('array rows keep symbol when projecting, and numeric strings sort numerically', () => {
    const rows = [ { 'symbol': 'X', 'v': '10' }, { 'symbol': 'Y', 'v': '9' }, { 'symbol': 'Z', 'v': '100' } ];
    const shaped = shapeResult (rows, { 'sortBy': '-v', 'fields': [ 'v' ] });
    assert.deepEqual (shaped.data, [ { 'symbol': 'Z', 'v': '100' }, { 'symbol': 'X', 'v': '10' }, { 'symbol': 'Y', 'v': '9' } ]);
    assert.deepEqual (shaped.meta.fields, [ 'symbol', 'v' ]);
});

test ('a single structure only takes fields; sortBy/limit are ignored with a notice', () => {
    const single = { 'symbol': 'BTC/USDT:USDT', 'fundingRate': 0.0001, 'markPrice': 50000, 'interval': '8h' };
    const shaped = shapeResult (single, { 'fields': [ 'fundingRate' ], 'limit': 5 });
    assert.deepEqual (shaped.data, { 'fundingRate': 0.0001 });
    assert.ok (shaped.meta.notice.includes ('single structure'));
});

test ('unknown sortBy / fields fail with the available field names', () => {
    assert.throws (() => shapeResult (rates, { 'sortBy': '-funding' }), (error: any) => error instanceof ArgError && error.hint.includes ('fundingRate'));
    assert.throws (() => shapeResult (rates, { 'fields': [ 'nope' ] }), (error: any) => error instanceof ArgError && error.hint.includes ('markPrice'));
    assert.throws (() => shapeResult (rates, { 'limit': 0 }), ArgError);
});
